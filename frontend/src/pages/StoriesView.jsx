import React, { useState, useEffect, useRef } from 'react';
import { apiCall } from '../api/apiCall';
import { useAppContext } from '../context/AppContext';
import { Heart, MessageCircle, Share2, Store, ChevronLeft, Loader2, Volume2, VolumeX, Trash2, Bookmark } from 'lucide-react';

const Story = ({ story, isActive, isMuted, toggleMute, onDelete }) => {
    const videoRef = useRef(null);
    const { user, addToast, navigate } = useAppContext();
    const [likes, setLikes] = useState(story.likes || 0);
    const [isLiked, setIsLiked] = useState(story.likedBy?.includes(user?._id) || false);
    const [isSaved, setIsSaved] = useState(user?.savedStories?.includes(story._id) || false);

    useEffect(() => {
        if (!videoRef.current) return;
        if (isActive) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
        } else {
            videoRef.current.pause();
        }
    }, [isActive]);

    const handleLike = async () => {
        if (!user) {
            addToast("Please log in to like stories.");
            return;
        }
        try {
            // Optimistic update
            setIsLiked(!isLiked);
            setLikes(isLiked ? likes - 1 : likes + 1);
            
            const { data } = await apiCall(`/stories/${story._id}/like`, "PUT");
            setLikes(data.likes);
            setIsLiked(data.likedByMe);
        } catch (err) {
            // Revert on error
            setIsLiked(!isLiked);
            setLikes(isLiked ? likes + 1 : likes - 1);
            addToast("Failed to like story.");
        }
    };

    const handleSave = async () => {
        if (!user) {
            addToast("Please log in to save stories.");
            return;
        }
        try {
            setIsSaved(!isSaved); // Optimistic UI
            const { data } = await apiCall(`/stories/${story._id}/save`, "PUT");
            setIsSaved(data.saved);
            
            // Update local storage user context
            if (data.savedStories) {
                const updatedUser = { ...user, savedStories: data.savedStories };
                localStorage.setItem('farmlink_user', JSON.stringify(updatedUser));
            }
        } catch (err) {
            setIsSaved(!isSaved); // Revert
            addToast("Failed to save story.");
        }
    };

    const handleVisitStore = () => {
        if (window.__setSelectedFarmer) {
            window.__setSelectedFarmer({ _id: story.farmerId, name: story.farmerName });
            navigate('farmer-storefront');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this story?")) return;
        try {
            await apiCall(`/stories/${story._id}`, 'DELETE');
            addToast("Story deleted");
            if (onDelete) onDelete(story._id);
        } catch (err) {
            addToast("Failed to delete story");
        }
    };

    return (
        <div className="relative w-full h-full snap-start snap-always bg-black flex items-center justify-center overflow-hidden">
            {/* Video Player */}
            <video
                ref={videoRef}
                src={story.videoUrl}
                className="w-full h-full object-cover cursor-pointer"
                loop
                playsInline
                muted={isMuted}
                onClick={toggleMute}
            />
            
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-20 flex flex-col items-center gap-6 z-10">
                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={handleVisitStore}>
                    <div className="w-12 h-12 bg-white rounded-full p-0.5 shadow-lg group-hover:scale-110 transition-transform relative">
                        <img 
                            src={story.farmerImage || `https://ui-avatars.com/api/?name=${story.farmerName}&background=random`} 
                            alt={story.farmerName} 
                            className="w-full h-full rounded-full object-cover" 
                        />
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            <Store size={10} className="inline mr-0.5" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={toggleMute}>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{isMuted ? "Unmute" : "Mute"}</span>
                </div>

                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={handleLike}>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Heart size={24} className={`transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">{likes}</span>
                </div>

                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => addToast("Comments coming soon!")}>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <MessageCircle size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">0</span>
                </div>

                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={handleSave}>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Bookmark size={24} className={`transition-all ${isSaved ? 'fill-blue-500 text-blue-500 scale-110' : 'text-white'}`} />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">Save</span>
                </div>

                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={() => addToast("Share link copied!")}>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Share2 size={24} className="text-white" />
                    </div>
                    <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </div>

                {(user?.role === 'admin' || user?._id === story.farmerId) && (
                    <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={handleDelete}>
                        <div className="w-12 h-12 bg-red-500/80 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">
                            <Trash2 size={24} className="text-white" />
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow-md">Delete</span>
                    </div>
                )}
            </div>

            {/* Bottom Info */}
            <div className="absolute left-4 bottom-6 right-20 z-10">
                <h3 className="text-white font-bold text-lg drop-shadow-md flex items-center gap-2">
                    {story.farmerName}
                    <span className="text-xs bg-green-500/80 backdrop-blur-sm px-2 py-0.5 rounded-md">Farmer</span>
                </h3>
                <p className="text-white/90 text-sm mt-2 drop-shadow-md line-clamp-3">
                    {story.caption}
                </p>
            </div>
        </div>
    );
};

const StoriesView = () => {
    const initialData = window.__storyInitialData || null;
    const [stories, setStories] = useState(initialData || []);
    const [loading, setLoading] = useState(!initialData);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(true); // Default to muted to guarantee autoplay
    const containerRef = useRef(null);
    const { navigate, addToast, history, setHistory, setView } = useAppContext();

    const goBack = () => {
        if (history && history.length > 1) {
            const newHistory = [...history];
            newHistory.pop();
            setHistory(newHistory);
            setView(newHistory[newHistory.length - 1]);
            window.scrollTo(0, 0);
        } else {
            navigate('home');
        }
    };

    // Read from global window object to support navigation without full page reload
    const farmerId = window.__storyFarmerId || null;
    const initialIndex = window.__storyInitialIndex || 0;
    
    // Set initial index synchronously if we have initial data
    useEffect(() => {
        if (initialData && initialData.length > 0 && initialIndex < initialData.length) {
            setActiveIndex(initialIndex);
        }
    }, []);
    
    const [hasScrolledToInitial, setHasScrolledToInitial] = useState(false);

    // Clean up globals on unmount
    useEffect(() => {
        return () => {
            delete window.__storyFarmerId;
            delete window.__storyInitialIndex;
            delete window.__storyInitialData;
        };
    }, []);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const url = farmerId ? `/stories?farmerId=${farmerId}` : '/stories';
                const { data } = await apiCall(url, 'GET');
                setStories(data);
                if (data.length > 0 && initialIndex < data.length && !initialData) {
                    setActiveIndex(initialIndex);
                }
            } catch (err) {
                if (!initialData) addToast("Failed to load stories");
            } finally {
                setLoading(false);
            }
        };
        
        // Always fetch to ensure we have the latest (e.g. likes/comments), 
        // but if initialData is provided, the UI renders instantly and updates in background.
        fetchStories();
    }, [farmerId]);

    useEffect(() => {
        if (!loading && stories.length > 0 && !hasScrolledToInitial && containerRef.current) {
            // Give layout a tick to measure height
            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.clientHeight * initialIndex;
                    setHasScrolledToInitial(true);
                }
            }, 100);
        }
    }, [loading, stories, hasScrolledToInitial, initialIndex]);

    const handleScroll = (e) => {
        const index = Math.round(e.target.scrollTop / e.target.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    const handleDeleteStory = (id) => {
        setStories(prev => prev.filter(s => s._id !== id));
    };

    if (loading) {
        return (
            <div className="w-full h-screen bg-black flex items-center justify-center flex-col gap-4">
                <Loader2 size={40} className="animate-spin text-green-500" />
                <p className="text-white font-bold">Loading Stories...</p>
            </div>
        );
    }

    if (stories.length === 0) {
        return (
            <div className="w-full h-screen bg-stone-900 flex items-center justify-center flex-col gap-4">
                <p className="text-stone-400 font-bold text-lg">No stories available yet.</p>
                <button 
                    onClick={() => navigate('home')}
                    className="px-6 py-2 bg-green-600 text-white rounded-full font-bold hover:bg-green-500 transition-colors"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <button 
                    onClick={goBack}
                    className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <h1 className="text-white font-black text-xl drop-shadow-lg tracking-wider">FARM STORIES</h1>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Scroll Container */}
            <div 
                ref={containerRef}
                onScroll={handleScroll}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            >
                {stories.map((story, index) => (
                    <Story 
                        key={story._id} 
                        story={story} 
                        isActive={index === activeIndex} 
                        isMuted={isMuted}
                        toggleMute={() => setIsMuted(!isMuted)}
                        onDelete={handleDeleteStory}
                    />
                ))}
            </div>
        </div>
    );
};

export default StoriesView;
