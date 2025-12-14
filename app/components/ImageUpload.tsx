"use client";
import { UploadButton } from "@/utils/uploadthing";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { getTranslation } from "../lib/i18n";
interface ImageUploadProps {
  onUpload: (url: string) => void;
  image?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, image }) => {
  const t=getTranslation()
  const [isUploading, setIsUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState(image);
  useEffect(() => {
    setImgUrl(image);
  }, [image]);

  return (
    <div className="flex flex-col items-center justify-center">
      {/* עיגול פרופיל */}
      <div className="relative w-[120px] h-[120px]">
        <div
          className="w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden"
          style={{
            borderColor: "#1d486a",
            backgroundColor: "#f0f0f0",
          }}
        >
          {imgUrl ? (
            <img
              src={imgUrl}
              className="w-full h-full object-cover"
              alt="Profile"
            />
          ) : (
            <svg width="60" height="60" viewBox="0 0 24 24" fill="#9ca3af">
              <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
            </svg>
          )}
        </div>

        <div
          className="absolute rounded-full shadow flex items-center justify-center"
          style={{
            width: "42px",
            height: "42px",
            backgroundColor: "#1d486a",
            bottom: "-4px", // תיקון מיקום מדויק
            right: "-4px", // תיקון מיקום מדויק
          }}
        >
          <Camera size={20} color="white" />
        </div>

        {/* שכבת העלאה שקופה */}
        <div className="absolute inset-0 opacity-0 cursor-pointer">
          <UploadButton
            endpoint="imageUploader"
            onUploadBegin={() => setIsUploading(true)}
            onClientUploadComplete={(res) => {
              setIsUploading(false);
              const fileUrl = res[0].ufsUrl;
              setImgUrl(fileUrl);
              onUpload(fileUrl);
            }}
            onUploadError={() => setIsUploading(false)}
          />
        </div>
      </div>

      {/* טקסט מתחת */}
      <p className="mt-2 text-sm cursor-pointer" style={{ color: "#1d486a" }}>
{t("clickForPic")}      </p>

      {/* טוען */}
      {isUploading && (
        <p className="text-sm mt-2" style={{ color: "#1d486a" }}>
          Uploading...
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
