import test from "node:test";
import assert from "node:assert/strict";
import Ticket from "../models/ticket.js";
import * as ticketController from "../controllers/ticketController.js";
import * as ticketService from "../services/ticketService.js";
import { ROLES } from "../constants/roles.js";

const rows = [
  { _id: "a-1", user: "user-a", subject: "Claim status one", category: "CLAIM", status: "OPEN" },
  { _id: "a-2", user: "user-a", subject: "Claim status two", category: "CLAIM", status: "OPEN" },
  { _id: "a-3", user: "user-a", subject: "Policy update", category: "POLICY", status: "OPEN" },
  { _id: "b-1", user: "user-b", subject: "Claim status secret", category: "CLAIM", status: "OPEN" },
];

function matches(ticket, filter = {}) {
  return Object.entries(filter).every(([key, expected]) => {
    if (key === "$or") {
      return expected.some((condition) =>
        Object.entries(condition).some(([field, expression]) => {
          const regex = new RegExp(expression.$regex, expression.$options);
          return regex.test(String(ticket[field] ?? ""));
        }),
      );
    }
    return String(ticket[key]) === String(expected);
  });
}

class FakeQuery {
  constructor(value, single = false) {
    this.value = Array.isArray(value) ? value : value ? [value] : [];
    this.single = single;
    this.offset = 0;
    this.size = Infinity;
  }

  populate() {
    return this;
  }

  sort() {
    return this;
  }

  skip(offset) {
    this.offset = offset;
    return this;
  }

  limit(size) {
    this.size = size;
    return this;
  }

  then(resolve, reject) {
    const result = this.single
      ? this.value[0] ?? null
      : this.value.slice(this.offset, this.offset + this.size);
    return Promise.resolve(result).then(resolve, reject);
  }
}

function installTicketModelMocks(t, records = rows) {
  const names = ["find", "findOne", "countDocuments", "create"];
  const originals = new Map(
    names.map((name) => [name, { own: Object.hasOwn(Ticket, name), value: Ticket[name] }]),
  );

  Ticket.find = (filter) => new FakeQuery(records.filter((ticket) => matches(ticket, filter)));
  Ticket.findOne = (filter) => {
    return new FakeQuery(records.find((ticket) => matches(ticket, filter)), true);
  };
  Ticket.countDocuments = async (filter) =>
    records.filter((ticket) => matches(ticket, filter)).length;

  t.after(() => {
    for (const [name, original] of originals) {
      if (original.own) Ticket[name] = original.value;
      else delete Ticket[name];
    }
  });
}

function responseRecorder() {
  return {
    statusCode: 200,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test("User A receives only User A tickets", async (t) => {
  installTicketModelMocks(t);
  const res = responseRecorder();

  await ticketController.getMyTickets(
    { user: { id: "user-a", role: ROLES.CUSTOMER }, query: { page: "1", limit: "10" } },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data.map((ticket) => ticket.user), ["user-a", "user-a", "user-a"]);
  assert.equal(res.body.pagination.total, 3);
});

test("User B receives only User B tickets", async (t) => {
  installTicketModelMocks(t);
  const res = responseRecorder();

  await ticketController.getMyTickets(
    { user: { id: "user-b", role: ROLES.CUSTOMER }, query: {} },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body.data.map((ticket) => ticket.user), ["user-b"]);
  assert.equal(res.body.pagination.total, 1);
});

test("User A cannot retrieve User B ticket by ID, while staff retain access", async (t) => {
  installTicketModelMocks(t);
  const res = responseRecorder();
  await ticketController.getTicketDetails(
    { user: { id: "user-a", role: ROLES.CUSTOMER }, params: { id: "b-1" } },
    res,
  );
  const ownerResult = await ticketService.getTicketById("b-1", {
    id: "user-a",
    role: ROLES.CUSTOMER,
  });
  const staffResult = await ticketService.getTicketById("b-1", {
    id: "agent-1",
    role: ROLES.AGENT,
  });

  assert.equal(res.statusCode, 404);
  assert.deepEqual(res.body, { message: "Ticket not found" });
  assert.equal(ownerResult, null);
  assert.equal(staffResult._id, "b-1");
});

test("search and pagination are applied after the authenticated owner filter", async (t) => {
  installTicketModelMocks(t);
  const res = responseRecorder();

  await ticketController.getMyTickets(
    {
      user: { id: "user-a", role: ROLES.CUSTOMER },
      query: { search: "claim", page: "2", limit: "1" },
    },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.pagination.total, 2);
  assert.equal(res.body.data.length, 1);
  assert.equal(res.body.data[0]._id, "a-2");
});

test("ticket creation ignores a frontend owner and assigns the authenticated user", async (t) => {
  let persistedTicket;
  const originals = { own: Object.hasOwn(Ticket, "create"), value: Ticket.create };
  Ticket.create = async (data) => {
    persistedTicket = data;
    return data;
  };
  t.after(() => {
    if (originals.own) Ticket.create = originals.value;
    else delete Ticket.create;
  });
  const res = responseRecorder();

  await ticketController.createTicket(
    {
      user: { id: "user-a", role: ROLES.CUSTOMER },
      body: { user: "user-b", subject: "Help", category: "ACCOUNT", priority: "LOW", description: "Login issue" },
    },
    res,
  );

  assert.equal(res.statusCode, 201);
  assert.equal(persistedTicket.user, "user-a");
  assert.equal(persistedTicket.messages[0].sender, "user-a");
});

test("admin ticket queue continues to include tickets from all users", async (t) => {
  installTicketModelMocks(t);
  const res = responseRecorder();

  await ticketController.getAllTickets(
    { user: { id: "admin-1", role: ROLES.ADMIN }, query: {} },
    res,
  );

  assert.equal(res.statusCode, 200);
  assert.deepEqual(new Set(res.body.data.map((ticket) => ticket.user)), new Set(["user-a", "user-b"]));
  assert.equal(res.body.pagination.total, 4);
});

test("a customer cannot reply to another customer's ticket", async (t) => {
  installTicketModelMocks(t);
  const ticket = await ticketService.replyToTicket(
    "b-1",
    { sender: "user-a", message: "hello" },
    { id: "user-a", role: ROLES.CUSTOMER },
  );

  assert.equal(ticket, null);
});
