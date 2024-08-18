'use client'

import {Avatar} from "@nextui-org/avatar";
import React from "react";
import { ImageIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import createPostAction from "@/actions/createPostAction";
// import { toast } from "sonner";
import { compressImage, compressVideo } from "@/lib/compress";

function PostForm() {
    const ref = useRef(null);
    const fileInputRef = useRef(null);
    const { data: session, status } = useSession();
    const [preview, setPreview] = useState(null);
    const [mediaType, setMediaType] = useState(null);

    const handlePostAction = async (formData) => {
        console.log("handlepostaction just in");
        const formDataCopy = formData;
        ref.current?.reset();
        const text = formDataCopy.get("postInput")?.toString();

        if (!text.trim()){
            throw new Error("You must provide a post input");
        }

        setPreview(null);
        setMediaType(null);
    
        try {
            console.log("started createpostaction");
            await createPostAction(formDataCopy, session);
            console.log("createpostaction finished");
        } catch (error) {
            console.log('Error creating post: ', error.message);
        }
    }

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        if(!file) return;

        let compressedFile;

        if (file.type.startsWith('image/')) {
            compressedFile = await compressImage(file);

        }else if (file.type.startsWith('video/')){
            compressedFile = await compressVideo(file);
        }else{
            compressedFile = file;
        }

        setPreview(URL.createObjectURL(file));
        setMediaType(file.type);
    }

    const renderPreview = () => {
        if (mediaType?.startsWith('image/')) {
            return <img src={preview} alt="Preview" className="w-full object-cover" />;
        } else if (mediaType?.startsWith('video/')) {
            return (
                <video controls className="w-full">
                    <source src={preview} type={mediaType} />
                    Your browser does not support the video tag.
                </video>
            );
        } else if (mediaType?.startsWith('audio/')) {
            return (
                <audio controls className="w-full">
                    <source src={preview} type={mediaType} />
                    Your browser does not support the audio element.
                </audio>
            );
        }
        return null;
    }

    return (
        
        <div>
            <div className="mb-2 bg-white rounded-xl border">
                <form
                ref={ref}
                action={(formData) => {
                    // const promise = 
                    handlePostAction(formData);
                    // toast.promise(promise, {
                    //     loading: "Creating post...",
                    //     success: "Post created!",
                    //     error: (e) => "Error creating post: " + e.message,
                    // });
                }}
                className="p-1 bg-transparent"
                >
                    <div className="ml-2 mr-1 mt-1 flex items-center space-x-2">
                        
                        {session?.user?.profileImage ? (
                            <Avatar
                                isBordered
                                color="primary"
                                size="sm"
                                radius="full"
                                src={session?.user?.profileImage}
                            />
                        ):(
                            <Avatar
                                isBordered
                                color=""
                                size="sm"
                                radius="full"
                                name={session?.user?.firstName.charAt(0) + session?.user?.lastName.charAt(0)}
                            />
                        )}

                        <input
                        ref={fileInputRef}
                        type="text"
                        name="postInput"
                        placeholder="Start writing a post..."
                        className="flex-1 outline-none rounded-xl px-4 bg-gray-200"
                        />

                        <input
                        ref={fileInputRef}
                        type="file"
                        name="media"
                        accept="image/*,video/*,audio/*"
                        hidden
                        onChange={handleImageChange}
                        />

                        <Button
                            type="submit"
                            color="primary"
                            size="md"
                            radius="sm"
                            variant="flat"
                        >
                            Post
                        </Button>

                    </div>
                    
                    {preview && (
                        <div className="mt-3">
                            {/* <img src={preview} alt="Preview" className="w-full object-cover" /> */}
                            {renderPreview()}
                        </div>
                    )}
                    
                    <div className="mr-1 mb-1 flex gap-4 items-center justify-end mt-2 space-x-4">
                        <Button
                            color="default"
                            size="sm"
                            radius="sm"
                            variant="ghost"
                            className="text-sm"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <ImageIcon className="mr-2" size={18} color="currentColor" />
                            {preview? "Change" : "Import"} Media
                        </Button>

                        {preview && (
                            <Button
                                color="danger"
                                size="sm"
                                radius="sm"
                                variant="ghost"
                                className="text-sm"
                                onClick={() => {
                                    setPreview(null);
                                    setMediaType(null);
                                }}
                            >
                                <XIcon className="mr-2" size={16} color="currentColor" />
                                Remove Media
                            </Button>
                        )}
                    </div>
                </form>
            </div>
            <hr className="mt-2 border-gray-300"/>
        </div>
    )
}

export default PostForm;