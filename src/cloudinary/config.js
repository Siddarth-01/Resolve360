import { Cloudinary } from "@cloudinary/url-gen";

const cld = new Cloudinary({
  cloud: {
    cloudName: "public_upload",
  },
});

export const cloudinaryConfig = {
  cloudName: "public_upload",
  uploadPreset: "public_upload",
  apiKey: "128923578591614",
  apiSecret: "0VSDdJDZipLyOCG154QaU2g2tf8",
};

export default cld;
