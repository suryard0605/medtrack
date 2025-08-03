import { useState } from "react";
import Tesseract from "tesseract.js";

export default function OCRTool() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setLoading(true);
    Tesseract.recognize(file, "eng", {
      logger: (m) => console.log(m)
    })
      .then(({ data: { text } }) => {
        setOcrText(text);
        setLoading(false);
      })
      .catch((err) => {
        setOcrText("Error reading image");
        setLoading(false);
      });
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI OCR Tool</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="border p-2 w-full rounded mb-4"
      />
      {image && (
        <img src={image} alt="Uploaded" className="mb-4 max-w-full max-h-64 border rounded" />
      )}
      {loading && <p className="text-blue-500">Reading text from image...</p>}
      {ocrText && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">{ocrText}</pre>
        </div>
      )}
    </div>
  );
}
