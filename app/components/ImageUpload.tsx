"use client";

import { UploadButton } from "@/utils/uploadthing";

interface ImageUploadProps {
  onUpload: (url: string) => void;  
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  return (
    <div>
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={(res) => {
          console.log("Files: ", res);
          const fileUrl=res[0].ufsUrl
          onUpload(fileUrl);}}
        onUploadError={(error: Error) => {
          console.error("Error during upload: ", error);
        }}
      />
    </div>
  );
};

export default ImageUpload;
