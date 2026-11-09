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
import {
  Upload,
  FileText,
  Shield,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Submit a New Claim
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Provide the details of the incident to initiate your claim process.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs">
            Save Draft
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-blue-600">
            View Guidelines
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form Area */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 1: Policy & Type
                </span>
              </div>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-slate-700">
                      Policy Identification
                    </Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        name="policyId"
                        value={formData.policyId}
                        onChange={handleChange}
                        placeholder="POL-000-000"
                        className="pl-10 h-10 border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-slate-700">
                      Claim Category
                    </Label>
                    <Select
                      value={formData.claimType}
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger className="h-10 border-slate-200">
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
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-3 border-b border-slate-200">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Step 2: Incident Details
                </span>
              </div>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-slate-700">
                    Description of Event
                  </Label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe exactly what happened..."
                    className="min-h-[120px] border-slate-200 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-slate-700">
                      Estimated Claim Amount
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <Input
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="pl-10 h-10 border-slate-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-medium text-slate-700">
                      Supporting Evidence
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="doc-upload"
                        type="file"
                        onChange={handleFile}
                        className="hidden"
                      />
                      <Label
                        htmlFor="doc-upload"
                        className="flex items-center justify-center w-full h-10 border border-dashed border-slate-300 rounded-md bg-slate-50 hover:bg-slate-100 cursor-pointer transition-all text-xs font-medium text-slate-600"
                      >
                        <Upload className="h-3 w-3 mr-2" />
                        {fileName ? fileName : "Upload Files (Max 10MB)"}
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between p-2">
              <div className="flex items-center text-xs text-slate-500 gap-2">
                <Info className="h-3.5 w-3.5" />
                Processing typically takes 7-10 business days.
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-11 rounded-lg shadow-md shadow-blue-200 transition-all"
              >
                {loading ? "Submitting..." : "Submit Claim Request"}
              </Button>
            </div>
          </form>
        </div>

        {/* Sidebar Info Area */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-slate-900 text-white border-none">
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4">
                <AlertCircle className="h-4 w-4 text-blue-400" />
                Quick Requirements
              </h3>
              <div className="space-y-4">
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
                  <div key={i} className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-medium">{item.title}</p>
                      <p className="text-[11px] text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="p-6 rounded-xl border border-blue-100 bg-blue-50/50">
            <h4 className="text-sm font-bold text-blue-900 mb-1">Need Help?</h4>
            <p className="text-xs text-blue-700 mb-4 leading-relaxed">
              Our claims specialists are available 24/7 for urgent assistance.
            </p>
            <Button
              variant="outline"
              className="w-full bg-white text-blue-600 border-blue-200 hover:bg-blue-50 text-xs h-9"
            >
              Chat with Agent
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
