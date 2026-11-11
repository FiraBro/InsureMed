import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Upload, Shield, DollarSign, Info, CheckCircle2 } from "lucide-react";
import { claimService } from "@/services/claimService";

export default function ClaimsSubmition() {
  const [formData, setFormData] = useState({
    policyId: "",
    claimType: "",
    description: "",
    amount: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSelectChange = (value) =>
    setFormData({ ...formData, claimType: value });

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      data.append("policyId", formData.policyId);
      data.append("claimType", formData.claimType);
      data.append("description", formData.description);
      data.append("amount", formData.amount);
      if (file) data.append("document", file);

      await claimService.createClaim(data);
      toast.success("Claim filed successfully!");
      setFormData({ policyId: "", claimType: "", description: "", amount: "" });
      setFile(null);
      setFileName("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "text-sm font-medium text-slate-700";
  const fieldClass =
    "h-11 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Submit a New Claim
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Provide the details of the incident to initiate your claim process.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8">
          <Card className="overflow-hidden rounded-xl border-slate-200 shadow-sm">
            <CardContent className="divide-y divide-slate-200 p-0">
              {/* Section 1 */}
              <section className="space-y-5 p-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Policy & Type
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Tell us which policy this claim belongs to.
                  </p>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="policyId" className={labelClass}>
                      Policy Identification
                    </Label>
                    <div className="relative">
                      <Shield className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="policyId"
                        name="policyId"
                        value={formData.policyId}
                        onChange={handleChange}
                        placeholder="POL-000-000"
                        className={`${fieldClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className={labelClass}>Claim Category</Label>
                    <Select
                      value={formData.claimType}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className={fieldClass}>
                        <SelectValue placeholder="Select type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          "Accident",
                          "Medical",
                          "Theft",
                          "Natural Disaster",
                        ].map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-5 p-6">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Incident Details
                  </h2>
                  <p className="mt-0.5 text-sm text-slate-500">
                    Describe what happened and attach any supporting files.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className={labelClass}>
                    Description of Event
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe exactly what happened..."
                    className="min-h-[140px] resize-y border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600/20"
                    required
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className={labelClass}>
                      Estimated Claim Amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className={`${fieldClass} pl-10`}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="doc-upload" className={labelClass}>
                      Supporting Evidence
                    </Label>
                    <Input
                      id="doc-upload"
                      type="file"
                      onChange={handleFile}
                      className="sr-only"
                    />
                    <Label
                      htmlFor="doc-upload"
                      className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-sm font-normal text-slate-600 transition-colors hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Upload className="h-4 w-4 shrink-0" />
                      <span className="truncate">
                        {fileName ? fileName : "Upload Files (Max 10MB)"}
                      </span>
                    </Label>
                  </div>
                </div>
              </section>

              {/* Footer */}
              <div className="flex flex-col gap-4 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <Info className="h-4 w-4 shrink-0" />
                  Processing typically takes 7-10 business days.
                </p>
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 rounded-lg bg-blue-600 px-6 text-white hover:bg-blue-700"
                >
                  {loading ? "Submitting..." : "Submit Claim Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <Card className="rounded-xl border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-base font-semibold text-slate-900">
                Quick Requirements
              </h3>
              <ul className="mt-4 space-y-4">
                {[
                  {
                    title: "Proof of Incident",
                    desc: "Photos or police reports",
                  },
                  {
                    title: "Payment Receipts",
                    desc: "For medical or repair costs",
                  },
                  { title: "Policy Status", desc: "Must be active & paid" },
                ].map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
