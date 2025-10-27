
import React, { useState, useCallback } from 'react';
import { generateCharacterSheetView, generateConceptArt } from './services/geminiService';
import { fileToData } from './utils/imageUtils';
import { ViewType, GeneratedImages, AspectRatio, UploadedFile } from './types';

// SVG Icon Components defined inside App.tsx for simplicity
const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
    </div>
);

const ImagePlaceholder = ({ label }: { label: string }) => (
    <div className="bg-gray-800 aspect-square rounded-lg flex flex-col justify-center items-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
        <span className="text-sm font-medium">{label}</span>
    </div>
);


const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'sheet' | 'concept'>('sheet');
    
    // Character Sheet State
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({ front: null, back: null, left: null, right: null });
    const [isSheetLoading, setIsSheetLoading] = useState(false);
    const [sheetError, setSheetError] = useState<string | null>(null);

    // Concept Art State
    const [prompt, setPrompt] = useState<string>('A cyberpunk VTuber with neon hair and holographic cat ears');
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('3:4');
    const [conceptImage, setConceptImage] = useState<string | null>(null);
    const [isConceptLoading, setIsConceptLoading] = useState(false);
    const [conceptError, setConceptError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const data = await fileToData(file);
                setUploadedFile(data);
                setGeneratedImages({ front: null, back: null, left: null, right: null });
                setSheetError(null);
            } catch (error) {
                console.error("Error processing file:", error);
                setSheetError("Failed to load image. Please try another file.");
            }
        }
    };

    const handleGenerateSheet = useCallback(async () => {
        if (!uploadedFile) {
            setSheetError("Please upload an image first.");
            return;
        }

        setIsSheetLoading(true);
        setSheetError(null);
        setGeneratedImages({ front: null, back: null, left: null, right: null });

        const views: ViewType[] = ['front', 'back', 'left', 'right'];
        
        try {
            await Promise.all(views.map(async (view) => {
                const imageUrl = await generateCharacterSheetView(uploadedFile.base64, uploadedFile.mimeType, view);
                setGeneratedImages(prev => ({ ...prev, [view]: imageUrl }));
            }));
        } catch (error) {
            console.error("Error generating character sheet:", error);
            setSheetError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsSheetLoading(false);
        }
    }, [uploadedFile]);

    const handleGenerateConcept = useCallback(async () => {
        if (!prompt) {
            setConceptError("Please enter a prompt.");
            return;
        }

        setIsConceptLoading(true);
        setConceptError(null);
        setConceptImage(null);

        try {
            const imageUrl = await generateConceptArt(prompt, aspectRatio);
            setConceptImage(imageUrl);
        } catch (error) {
            console.error("Error generating concept art:", error);
            setConceptError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsConceptLoading(false);
        }
    }, [prompt, aspectRatio]);
    
    const TabButton: React.FC<{ tabId: 'sheet' | 'concept'; children: React.ReactNode }> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                activeTab === tabId
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans">
            <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 p-4 sticky top-0 z-10">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                        VTuber Four-View Generator
                    </h1>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8">
                <div className="flex justify-center mb-6 space-x-4">
                    <TabButton tabId="sheet">Character Sheet Generator</TabButton>
                    <TabButton tabId="concept">Concept Art Generator</TabButton>
                </div>

                {activeTab === 'sheet' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Controls */}
                        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col space-y-6 h-fit">
                            <h2 className="text-xl font-semibold border-b border-gray-600 pb-3">1. Upload Character</h2>
                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <UploadIcon />
                                        <p className="mb-2 text-sm text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, WEBP (MAX. 5MB)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
                                </label>
                            </div>
                            
                            {uploadedFile?.objectURL && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-gray-300 mb-2">Preview:</p>
                                    <img src={uploadedFile.objectURL} alt="Uploaded preview" className="rounded-lg w-full max-h-64 object-contain" />
                                </div>
                            )}

                            <h2 className="text-xl font-semibold border-b border-gray-600 pb-3">2. Generate Sheet</h2>
                            <button 
                                onClick={handleGenerateSheet}
                                disabled={!uploadedFile || isSheetLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                            >
                                {isSheetLoading ? 'Generating...' : 'Generate 4-View Sheet'}
                            </button>
                            {sheetError && <p className="text-red-400 text-sm mt-2">{sheetError}</p>}
                        </div>

                        {/* Results */}
                        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
                            <h2 className="text-xl font-semibold mb-4">Generated Views</h2>
                            {isSheetLoading && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center"><LoadingSpinner/></div>
                                        <p className="text-sm text-gray-400">Front</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center"><LoadingSpinner/></div>
                                        <p className="text-sm text-gray-400">Back</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center"><LoadingSpinner/></div>
                                        <p className="text-sm text-gray-400">Left</p>
                                    </div>
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="w-full aspect-square bg-gray-700 rounded-lg flex items-center justify-center"><LoadingSpinner/></div>
                                        <p className="text-sm text-gray-400">Right</p>
                                    </div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Object.entries(generatedImages).map(([key, src]) => (
                                    <div key={key} className="flex flex-col items-center space-y-2">
                                        {src ? <img src={src} alt={`${key} view`} className="w-full aspect-square object-cover rounded-lg bg-gray-700" /> : <ImagePlaceholder label={key.charAt(0).toUpperCase() + key.slice(1)} />}
                                        <p className="text-sm text-gray-400 capitalize">{key}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                
                {activeTab === 'concept' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col space-y-6 h-fit">
                            <h2 className="text-xl font-semibold border-b border-gray-600 pb-3">1. Describe Your Vision</h2>
                            <div>
                                <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
                                <textarea id="prompt" rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition"></textarea>
                            </div>
                            <div>
                                <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
                                <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value as AspectRatio)} className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2.5 text-white focus:ring-purple-500 focus:border-purple-500 transition">
                                    <option value="1:1">Square (1:1)</option>
                                    <option value="3:4">Portrait (3:4)</option>
                                    <option value="4:3">Landscape (4:3)</option>
                                    <option value="9:16">Tall (9:16)</option>
                                    <option value="16:9">Widescreen (16:9)</option>
                                </select>
                            </div>
                            <button onClick={handleGenerateConcept} disabled={isConceptLoading} className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center">
                                {isConceptLoading ? 'Generating...' : 'Generate Concept Art'}
                            </button>
                            {conceptError && <p className="text-red-400 text-sm mt-2">{conceptError}</p>}
                        </div>

                        <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-center items-center">
                             <h2 className="text-xl font-semibold mb-4 w-full">Generated Concept</h2>
                            <div className="w-full h-full min-h-[400px] flex justify-center items-center">
                                {isConceptLoading ? <LoadingSpinner /> : conceptImage ? <img src={conceptImage} alt="Generated concept art" className="max-w-full max-h-[80vh] rounded-lg object-contain" /> : <ImagePlaceholder label="Your concept art will appear here" />}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default App;
