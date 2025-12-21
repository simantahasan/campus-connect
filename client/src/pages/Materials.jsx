import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Upload, FileText, Download, BookOpen, Layers } from 'lucide-react';

const Materials = () => {
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'upload'
  const [materials, setMaterials] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Upload Form State
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [topics, setTopics] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // -------------------------------------------
  // 1. FETCH MATERIALS (On Load & Search)
  // -------------------------------------------
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async (query = "") => {
    try {
      // If there is a query, use search API, otherwise get all
      const url = query 
        ? `http://localhost:5000/api/materials/search?q=${query}`
        : `http://localhost:5000/api/materials`;
      
      const res = await axios.get(url);
      setMaterials(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // Handle Search Input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    fetchMaterials(e.target.value);
  };

  // -------------------------------------------
  // 2. AI RECOMMENDATION (Simulated)
  // -------------------------------------------
  const handleAiFilter = async (category) => {
    // This simulates clicking a topic like "CSE" and getting suggestions
    setSearchQuery(category);
    fetchMaterials(category);
    toast.success(`🤖 AI: Showing materials for ${category}`);
  };

  // -------------------------------------------
  // 3. HANDLE FILE UPLOAD
  // -------------------------------------------
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title || !courseCode) {
      return toast.error("Please fill in all fields");
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("courseCode", courseCode);
    formData.append("topics", topics);
    formData.append("userId", user._id);

    try {
      await axios.post("http://localhost:5000/api/materials/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Material Uploaded Successfully! 🎉");
      
      // Reset Form
      setTitle("");
      setCourseCode("");
      setTopics("");
      setFile(null);
      setIsUploading(false);
      setActiveTab('browse'); // Switch back to list
      fetchMaterials(); // Refresh list
    } catch (err) {
      console.log(err);
      toast.error("Upload failed");
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      
      {/* --- HEADER --- */}
      <div className="max-w-5xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="text-campus-red" /> Study Materials
          </h1>
          <p className="text-gray-500">Access notes, slides, and past papers for your courses.</p>
        </div>
        
        {/* Toggle Buttons */}
        <div className="bg-white p-1 rounded-lg shadow-sm border flex">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'browse' ? 'bg-campus-red text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Browse
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              activeTab === 'upload' ? 'bg-campus-red text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upload
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* --- VIEW: BROWSE & SEARCH --- */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text"
                placeholder="Search by Course Code (e.g., CSE110) or Title..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-campus-red focus:outline-none shadow-sm"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>

            {/* AI Suggestion Chips */}
            <div className="flex gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-500 flex items-center mr-2">
                <Layers size={14} className="mr-1"/> AI Suggestions:
              </span>
              {["CSE", "MAT", "ENG", "PHY", "BUS"].map(code => (
                <button 
                  key={code}
                  onClick={() => handleAiFilter(code)}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-red-50 hover:border-campus-red transition"
                >
                  {code}
                </button>
              ))}
            </div>

            {/* Materials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {materials.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-400">
                  No materials found. Be the first to upload!
                </div>
              ) : (
                materials.map((item) => (
                  <div key={item._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-red-100 text-campus-red p-2 rounded-lg">
                        <FileText size={24} />
                      </div>
                      <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
                        {item.courseCode}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-gray-800 truncate" title={item.title}>{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Topics: {item.topics.join(", ") || "General"}
                    </p>
                    
                    <div className="mt-4 pt-4 border-t flex justify-between items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                      <a 
                        href={`http://localhost:5000/${item.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center text-sm text-campus-red font-semibold hover:underline"
                      >
                        <Download size={16} className="mr-1" /> Download
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: UPLOAD FORM --- */}
        {activeTab === 'upload' && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Upload className="mr-2 text-campus-red" /> Upload New Material
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Lab Report 3, Midterm Notes"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-campus-red focus:outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. CSE110, MAT120"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-campus-red focus:outline-none uppercase"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topics (Tags)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Loops, Arrays, Pointer (Comma separated)"
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-campus-red focus:outline-none"
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach File (PDF/Image)</label>
                <input 
                  type="file" 
                  className="w-full p-2 border border-dashed border-gray-300 rounded-lg bg-gray-50"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isUploading}
                className="w-full bg-campus-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50 mt-4"
              >
                {isUploading ? "Uploading..." : "Share Material"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Materials;