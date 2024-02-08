'use client'
import { useEffect, useState } from "react"
import { db, storage } from '../firebase'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import Dropzone from "react-dropzone";
import { FileIcon, defaultStyles } from "react-file-icon";
import { COLOR_EXTENSION_MAP } from "@/Constant";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Create = () => {
    const [files, setFiles] = useState([])
    const [progress, setProgress] = useState('')
    const [dropped, setDropped] = useState(false)
    const [title, setTitle] = useState('')
    const [desc, setDesc] = useState('')
    const [Maindesc, setMaindesc] = useState('')
    const [completed, setCompleted] = useState(false)

    const bytesToSize = (bytes) => {
        const kilobytes = bytes / 1024;
        const megabytes = kilobytes / 1024;

        if (megabytes >= 1) {
            return `${megabytes.toFixed(2)} MB`;
        } else {
            return `${kilobytes.toFixed(2)} KB`;
        }
    };

    const wordCount = ((desc ?? '').trim() ?? '').split(/\s+/).filter(Boolean).length;
    const handleDescChange = (e) => {
        const inputDesc = e.target.value;
        const words = inputDesc.trim().split(/\s+/); // Split input by whitespace
        if (words.length <= 30) {
            setDesc(inputDesc);
        }
    };

    const handleFiles = (files) => {
        if (files[0].length !== 0 && files[0].size > 10000000) {
            notify();
            return;
        }
        setFiles((prevFiles) => [...prevFiles, ...files]);
    }

    const handleDelete = (fileToDelete) => {
        setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToDelete));
        setDropped(false);
    };

    // const handleDelete = (fileToDelete) => {
    //     setFiles((prevFiles) => prevFiles.filter((file) => file !== fileToDelete));
    // };

    const notify = () => toast.success('Uploaded Successfully!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
    });

    const { isSignedIn, isLoaded, user } = useUser()
    const handleUpload = async () => {
        try {
            // Loop through each file and store metadata and content
            for (const file of files) {
                // Storing metadata in Firestore
                const docRef = await addDoc(collection(db, 'users'), {
                    userId: user.id,
                    fullname: user.fullName,
                    filename: file.name,
                    size: file.size,
                    type: file.type,
                    title: title,
                    desc: desc,
                    blog: Maindesc,
                    timestamp: serverTimestamp(),
                });

                // Storing file content in Firebase Storage
                const storageRef = ref(storage, `users/${docRef.id}`);
                const uploadTask = uploadBytesResumable(storageRef, file);

                // Listen for state changes, including progress updates
                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        // console.log(`Upload for ${file.name} is ${progress.toFixed(2)}% done`);
                        setProgress(`${progress.toFixed(0)}%`)
                        if (progress === 100) {
                            notify();
                            setTimeout(() => {
                                setDesc('')
                                setTitle('')
                                setMaindesc('')
                                setCompleted(true)
                                setProgress('')
                                setFiles([])
                            }, 1000);
                        }
                    },
                    (error) => {
                        console.error(`Error uploading ${file.name}:`, error);
                    },
                    async () => {
                        // Upload completed, update Firestore document with downloadUrl
                        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        await updateDoc(doc(db, 'users', docRef.id), {
                            downloadUrl: downloadUrl,
                        });
                    }
                );
            }
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };


    return (
        <div className="flex flex-col w-screen items-center justify-center py-12">
            <div className="flex w-screen h-auto items-center justify-center gap-6 flex-col lg:w-[36rem]">
                <div className="w-full ">
                    <Dropzone
                        accept={{
                            'image/*': ['.png', '.jpg'],
                            'video/*': ['.mp4'],
                        }}
                        onDrop={(file) => {
                            handleFiles(file);
                            setDropped(true);
                        }}
                        multiple={false}
                    >
                        {({ getRootProps, getInputProps, isDragActive, isDragReject, fileRejections, }) => (
                            <section className="w-full flex items-center justify-center">
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <div className={`rounded-lg border w-[90vw] lg:w-[33.3rem] min-h-[14rem] p-5 ${isDragActive && !isDragReject ? 'bg-[#006494]/70' : 'bg-[#402aff]'} ${dropped && 'bg-zinc-50'} flex items-center justify-center`}>
                                        {dropped && files.length > 0 ? (
                                            <div className="w-full h-full flex items-center justify-center gap-6">
                                                <span className="w-[5rem] h-[5rem]">
                                                    <FileIcon extension={files[0].type.split('/')[1]}
                                                        color='#dadada4c'
                                                        fold
                                                        radius={3}
                                                        glyphColor='#000'
                                                        labelColor={COLOR_EXTENSION_MAP[files[0].type.split('/')[1]]}
                                                        labelUppercase
                                                        {...defaultStyles[files[0].type.split('/')[1]]} />
                                                </span>
                                                <span className="flex flex-col items-start justify-center">
                                                    <h1 className="truncate w-48"><strong>Name:</strong> {files[0].name}</h1>
                                                    <h2><strong>Size:</strong> {bytesToSize(files[0].size)}</h2>
                                                    <h2><strong>Type:</strong> {files[0].type}</h2>
                                                </span>
                                                <XMarkIcon className="w-10 h-10 text-red-600 cursor-pointer hover:bg-gray-200/30 p-1 rounded-md" onClick={() => handleDelete(files[0])} />
                                            </div>
                                        ) : (
                                            <span className="w-full h-full flex items-center justify-center">
                                                {!isDragActive &&
                                                    <div className="flex items-center justify-center flex-col text-center ">
                                                        <svg className="w-12 h-12 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                                        <p className="mb-2 text-sm md:text-2xl text-center text-white/60"> <strong className="text-white/90">Click</strong> to upload or <strong className="text-white/90">drag and drop</strong> your file</p>
                                                        <p className="text-xs text-white/90">PNG, JPG or MP4 (MAX SIZE: 10MB)</p>
                                                    </div>
                                                }

                                                {isDragActive && !isDragReject &&
                                                    <p className="text-xl text-white"> Drop here to upload the file </p>
                                                }
                                            </span>
                                        )}

                                    </div>
                                </div>

                            </section>
                        )}
                    </Dropzone>


                </div>

                <div className="flex flex-col p-5 w-full lg:w-full gap-6 relative input_container">
                    <h1 className="text-center text-xl font-bold text-[#402aff]">Fill in the following fields to upload your blog</h1>
                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                        }}
                        className="outline-none border w-full p-3 rounded"
                    />
                    <span className="w-full h-full relative bg-transparent">
                        <textarea type="text" placeholder="Description" value={desc} onChange={(e) => { setDesc(e.target.value) }}
                            className="w-full h-36 p-3 outline-none border rounded desc"
                        />
                        <p className={`absolute right-4 bottom-4 text-sm ${wordCount >= 80 ? 'text-red-600' : 'text-[#402aff]'} `}>{wordCount}/30</p>
                    </span>
                    <textarea type="text" placeholder="Blog content" value={Maindesc} onChange={(e) => { setMaindesc(e.target.value) }}
                        className="w-full h-56 p-3 outline-none border rounded"
                    />

                </div>
            </div>



            <button
                disabled={files.length === 0 || wordCount > 80 || wordCount === 0 || desc === '' || title === '' || Maindesc === ''}
                onClick={() => {
                    handleUpload();
                    progress === '0%';
                    setCompleted(false);
                }}
                className={`uploadBtn w-[50%] md:w-[15rem] h-[3rem] bg-[#402aff] focus:bg-[#402aff]/60 mt-10 rounded-md text-white focus:text-[#402aff] disabled:bg-gray-500/30 hover:bg-[#402aff]/60 active:bg-[#402aff]/60 active:scale-[0.94] trans flex items-center sm:justify-start ${progress === '' || progress === '0%' ? 'justify-center' : 'justify-start'} relative`}
            >
                <div
                    className={`flex h-full items-center justify-center ${files.length === 0 || wordCount > 80 || wordCount === 0 || desc === '' || title === '' || Maindesc === '' ? `bg-none` : `bg-[#402aff]`} rounded-md overflow-hidden`}
                    style={{ width: `${progress === '0%' ? '0%' : progress}` }}
                >
                    <p className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]">
                        {completed ? 'Upload' : progress === '' || progress === '0%' ? 'Upload' : 'Uploading...' + progress}
                    </p>
                    <p className="absolute left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] text-white">
                        {completed ? 'Upload' : progress === '' || progress === '0%' ? 'Upload' : 'Uploading...' + progress}
                    </p>
                </div>
            </button>
            <ToastContainer />
        </div >
    )
}

export default Create
