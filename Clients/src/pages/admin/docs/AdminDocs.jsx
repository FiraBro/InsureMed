import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCheckCircle,
  FiCreditCard,
  FiFileText,
  FiInfo,
  FiSearch,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const sections = [
  {
    id: "overview",
    title: "Getting started",
    icon: FiBookOpen,
    keywords: "dashboard metrics overview sidebar role permissions admin agent customer",
    paragraphs: [
      "The admin workspace is available to authenticated users whose role is admin. The /admin route group is protected in the frontend, and the API also checks roles on administrative endpoints.",
      "The Dashboard shows Revenue, Policies, Pending applications, and Users, plus monthly policy volume and recent activity. Values come from the dashboard API; a connection failure is shown in place of the metrics.",
      "Use the sidebar to move between the operational queues, product tools, support desk, and Control Center. The page content scrolls independently from the fixed sidebar and top bar.",
    ],
    links: [
      ["Dashboard", "/admin/dashboard"],
      ["Control Center", "/admin/settings"],
    ],
    callout: { type: "tip", title: "Roles", text: "The system defines admin, agent, and customer roles. Admin pages require admin. Agents can access staff ticket listing, replies, and ticket status changes through the API; admin-only tools include customer administration, plan/policy operations, settings, and ticket assignment." },
  },
  {
    id: "plans",
    title: "Create and manage plans",
    icon: FiShield,
    keywords: "plan create edit publish draft pricing premium coverage deductible features visibility risk score category members age validity",
    paragraphs: [
      "Create a plan from New Plan. The guided form has Basic Info, Pricing, Features, Visibility, Risk Score, and Review steps. Risk preview is recalculated as the form changes; review the resulting recommendations before publishing.",
      "Plan fields include name and descriptions, premium and coverage amount, deductible, currency, premium frequency (monthly, quarterly, annually), plan type/category, features and exclusions, age limits, maximum members, validity period, popularity/featured flags, and status.",
      "All Plans lets admins search and filter plans, change published/draft visibility, edit a plan, or soft-delete it. Public plan listings are served separately from the admin listing. A published plan can be selected by customers for an application.",
    ],
    steps: ["Open New Plan and complete each of the six steps.", "Check pricing, eligibility limits, benefits, exclusions, visibility, and risk recommendations in Review.", "Publish the plan. To hide it from public listings, switch its status to draft in All Plans; use edit to revise fields."],
    badges: ["published", "draft"],
    links: [["New Plan", "/admin/create/plan"], ["All Plans", "/admin/all-plans"]],
    callout: { type: "warning", title: "Plan status is not policy status", text: "Plan visibility uses published/draft. Customer policies use active, expired, pending_renewal, renewed, or cancelled." },
  },
  {
    id: "applications",
    title: "Review applications",
    icon: FiFileText,
    keywords: "applications policy queue approve reject pending personal nominee medical payment documents pdf file",
    paragraphs: [
      "New customer applications appear under Applications with applicant and plan details, submission date, and pending/approved/rejected status. Search the queue and open a row to inspect its details and uploaded documents.",
      "The application stores personal details, nominee name/relationship, medical history/details, payment frequency and method, terms agreement, and uploaded files. The upload endpoint accepts multiple files under the documents field.",
      "Approve only a pending application after reviewing the submitted information and documents. Approval changes the application to approved and creates an active policy using the selected plan’s premium, coverage snapshot, and validity period. Rejecting records a reason (defaults to “No reason provided”) and notifies the applicant.",
    ],
    steps: ["Open Applications and search or browse the queue.", "Inspect the applicant, selected plan, declarations, payment preference, agreement, and attached files.", "Approve to create the policy, or reject with a clear reason. The customer receives a notification of the decision."],
    badges: ["pending", "approved", "rejected"],
    links: [["Applications", "/admin/applications"], ["Policies", "/admin/all-policies"]],
    callout: { type: "tip", title: "Approval guard", text: "Only pending applications can be approved. The server also blocks approval if the customer already has an active policy for the same plan." },
  },
  {
    id: "policies",
    title: "Manage policies and renewals",
    icon: FiCheckCircle,
    keywords: "policy active expired pending renewal renewed cancelled status renewal reference premium dates delete",
    paragraphs: [
      "Policies are created when applications are approved. The policy record includes a generated policy number, customer, plan, start/end dates, premium, currency, and a snapshot of plan name, coverage amount, and plan type.",
      "In Policies, search and filter records, inspect policy/customer information, and use the row actions to update status, cancel, or remove a record (soft delete). Status changes and cancellations notify the policyholder.",
      "A customer can request renewal and provide a payment reference. That request is not a payment transaction: an admin reviews it and uses the renewal approval action to extend the policy and set its new end date. Renewals update renewal count and last-renewed date.",
    ],
    badges: ["active", "expired", "pending_renewal", "renewed", "cancelled"],
    links: [["Policies", "/admin/all-policies"]],
    callout: { type: "warning", title: "Renewal review", text: "Confirm the submitted payment reference and proposed dates against your operational records before approving. The application does not expose a separate payment ledger or gateway settlement screen." },
  },
  {
    id: "claims",
    title: "Process claims",
    icon: FiCheckCircle,
    keywords: "claims pending approved rejected claim type amount reason policy number document upload review",
    paragraphs: [
      "Customer claims arrive in Claims Registry with claimant, generated reference, policy number, claim type, amount, status, reason, and optional supporting document. The customer must submit a policy belonging to their account.",
      "Open a claim to inspect the details and document. Verify the policy number and claimant, check that the evidence supports the claim, and assess the requested amount before deciding.",
      "For a pending claim, use the approve or reject action and confirm the status change. The available claim statuses are Pending, Approved, and Rejected; the customer is notified after approval or rejection. There is no request-for-updates status/action in the current claim workflow, so use the support desk to communicate when more information is needed.",
    ],
    steps: ["Open Claims and search by policy number, claim type, or status.", "Review the claimant, associated policy, reason, amount, and uploaded document.", "Approve or reject a pending claim. If evidence is incomplete, contact the customer through Support Desk before making a decision."],
    badges: ["Pending", "Approved", "Rejected"],
    links: [["Claims", "/admin/all-claims"], ["Support Desk", "/admin/support/tickets"]],
    callout: { type: "warning", title: "Evidence checks", text: "The API accepts one claim document. Check that it is readable and belongs to the claim before updating status." },
  },
  {
    id: "users",
    title: "Customers and account verification",
    icon: FiUsers,
    keywords: "users customers account verification isVerified active applicant registered profile email status export csv",
    paragraphs: [
      "The customer registry supports search, pagination, status filters, profile inspection, CSV export, updates, and deletion. User accounts include full name, email, phone, address, date of birth, gender, membership tier, role, account status, and isVerified.",
      "Email verification is represented by isVerified. Verification happens through the email verification flow; the admin registry page does not provide a dedicated verify toggle. Account status is a separate field and defaults to active.",
      "The registry UI includes applicant and registered filters. Treat these as registry views; they do not replace the account role or isVerified field. Confirm the account record before changing user details or removing a record.",
    ],
    links: [["Customers", "/admin/users"]],
    callout: { type: "tip", title: "Account checks", text: "A customer may have an active account while their email is not verified. Read isVerified and status as separate pieces of information." },
  },
  {
    id: "payments-documents",
    title: "Payments and documents",
    icon: FiCreditCard,
    keywords: "payment billing frequency method reference renewal documents pdf uploads file uploads storage errors",
    paragraphs: [
      "Payment data currently records preferences on an application (frequency and method) and a customer-supplied paymentReference on a renewal request. Policy records retain the premium and currency. The admin interface has financial analytics, but the models/routes do not define individual payment records or a payment reconciliation queue.",
      "Application documents are uploaded as an array; a claim accepts one file under document. The backend serves uploaded files from /uploads. Application document records include name, URL, file type, size, and upload time; claim records store documentUrl.",
      "Use the details view to open a file. If a document is missing or unreadable, verify the record’s upload link and ask the customer to contact Support Desk. Do not treat a saved payment preference or reference as proof of a settled transaction without external confirmation.",
    ],
    callout: { type: "info", title: "PDFs", text: "PDFs may be attached to application or claim records. The current upload code does not impose a PDF-only restriction, so validate file relevance and readability during review." },
  },
  {
    id: "support-settings",
    title: "Support and system settings",
    icon: FiHelpCircle,
    keywords: "support ticket status open in review waiting resolved closed assign agent faq settings maintenance analytics system",
    paragraphs: [
      "Support Desk lists tickets, supports status changes and replies, and admins can assign tickets. Ticket transitions are OPEN → IN_REVIEW/CLOSED; IN_REVIEW → WAITING/RESOLVED/CLOSED; WAITING → IN_REVIEW/RESOLVED; RESOLVED → CLOSED/IN_REVIEW; CLOSED → OPEN. Agents can work tickets but only admins assign them.",
      "Control Center contains Business Intelligence and System Config. Settings include system-level controls such as maintenance mode; when maintenance mode is active, non-admin users see the maintenance page.",
      "If a page reports a connection or loading error, check that the API is reachable and the current account has the required role. Admin dashboard metrics are loaded from the admin overview endpoint; settings are loaded separately.",
    ],
    badges: ["OPEN", "IN_REVIEW", "WAITING", "RESOLVED", "CLOSED"],
    links: [["Support Desk", "/admin/support/tickets"], ["Control Center", "/admin/settings"]],
  },
];

function Callout({ item }) {
  const styles = {
    tip: "border-emerald-200 bg-emerald-50 text-emerald-900",
    warning: "border-amber-200 bg-amber-50 text-amber-950",
    info: "border-blue-200 bg-blue-50 text-blue-950",
  }[item.type];
  const Icon = item.type === "warning" ? FiAlertCircle : item.type === "tip" ? FiCheckCircle : FiInfo;
  return <div className={`mt-5 flex gap-3 rounded-xl border p-4 ${styles}`}><Icon className="mt-0.5 shrink-0" /><div><p className="text-sm font-semibold">{item.title}</p><p className="mt-1 text-sm leading-6 opacity-90">{item.text}</p></div></div>;
}

export default function AdminDocs() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = useMemo(() => sections.filter((section) => {
    if (!normalizedQuery) return true;
    return `${section.title} ${section.keywords} ${section.paragraphs.join(" ")} ${(section.steps || []).join(" ")}`.toLowerCase().includes(normalizedQuery);
  }), [normalizedQuery]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-1 py-2 md:px-2">
      <header className="rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 p-6 text-white shadow-sm md:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white/15 p-3"><FiBookOpen className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">Admin handbook</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">Operations documentation</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">Guides for the plans, applications, policies, claims, customers, support, and settings available in this workspace.</p>
          </div>
        </div>
        <div className="relative mt-6 max-w-2xl">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documentation… try “renewal” or “verification”" aria-label="Search documentation" className="h-12 border-white/30 bg-white pl-10 text-slate-900 placeholder:text-slate-400 focus-visible:ring-white/40" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="px-4 pb-2 pt-4"><CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">Contents</CardTitle></CardHeader>
            <CardContent className="space-y-1 px-2 pb-3">
              {visibleSections.map((section) => (
                <a key={section.id} href={`#${section.id}`} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-blue-50 hover:text-blue-700">
                  <section.icon className="shrink-0 text-base" /><span>{section.title}</span>
                </a>
              ))}
              {visibleSections.length === 0 && <p className="px-3 py-2 text-sm text-slate-500">No matching sections.</p>}
            </CardContent>
          </Card>
          <Card className="mt-4 hidden border-blue-100 bg-blue-50/70 shadow-none lg:block"><CardContent className="p-4"><p className="text-sm font-semibold text-blue-950">Need a task?</p><p className="mt-1 text-xs leading-5 text-blue-800">Jump to the relevant admin tool.</p><Button asChild variant="outline" size="sm" className="mt-3 border-blue-200 bg-white text-blue-700"><Link to="/admin/dashboard">Open dashboard</Link></Button></CardContent></Card>
        </aside>

        <main className="min-w-0 space-y-5">
          {visibleSections.length ? visibleSections.map((section, index) => (
            <motion.section key={section.id} id={section.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: Math.min(index * 0.025, 0.15) }} className="scroll-mt-5">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3"><div className="rounded-lg bg-blue-50 p-2 text-blue-700"><section.icon className="h-5 w-5" /></div><div className="min-w-0"><CardTitle className="text-lg text-slate-900">{section.title}</CardTitle><div className="mt-2 flex flex-wrap gap-2">{section.badges?.map((status) => <Badge key={status} variant="outline" className="border-slate-200 bg-slate-50 font-medium text-slate-600">{status}</Badge>)}</div></div></div>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
                  {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  {section.steps && <ol className="space-y-2 rounded-xl bg-slate-50 p-4">{section.steps.map((step, i) => <li key={step} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">{i + 1}</span><span>{step}</span></li>)}</ol>}
                  {section.links && <div className="flex flex-wrap gap-2">{section.links.map(([label, to]) => <Button asChild key={to} variant="outline" size="sm" className="border-slate-200 text-blue-700"><Link to={to}>{label}</Link></Button>)}</div>}
                  {section.callout && <Callout item={section.callout} />}
                </CardContent>
              </Card>
            </motion.section>
          )) : <Card className="border-slate-200"><CardContent className="flex flex-col items-center py-12 text-center"><FiSearch className="h-8 w-8 text-slate-300" /><p className="mt-3 font-medium text-slate-800">No matching documentation</p><p className="mt-1 text-sm text-slate-500">Try another keyword or clear your search.</p><Button variant="ghost" className="mt-2 text-blue-700" onClick={() => setQuery("")}>Clear search</Button></CardContent></Card>}

        </main>
      </div>
    </div>
  );
}
