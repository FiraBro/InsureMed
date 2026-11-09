import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FiFile, FiFileText, FiUpload } from "react-icons/fi";
export default function DocumentsStep({
  fileInputRef,
  handleFileChange,
  formData,
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="mb-4 block">Required Documents</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
          <FiUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="font-medium text-gray-700 mb-2">
            Drag & drop files or click to upload
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Supported files: PDF, JPG, PNG (Max 10MB each)
          </p>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileChange(Array.from(e.target.files))}
          />

          {/* Trigger Button */}
          <Button
            variant="outline"
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="cursor-pointer border-gray-200"
          >
            <FiFile className="mr-2" />
            Choose Files
          </Button>
        </div>
      </div>

      {formData.files.length > 0 && (
        <div className="space-y-3">
          <Label>Uploaded Files</Label>
          {formData.files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                <FiFileText className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-white">
                Uploaded
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
