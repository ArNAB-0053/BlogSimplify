'use client'
import { useEffect, useState } from "react"
import { db, storage } from '../firebase'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useUser } from "@clerk/nextjs";
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import Dropzone from "react-dropzone";

const Create = () => {



    const handleUpload = async () => {
        const docRef = await addDoc(collection(db, "cities"), {
            name: "Tokyo",
            country: "Japan"
        });
        console.log(docRef.id)
    }
    // const [files, setFiles] = useState([])
    // // const { isLoaded, userId, sessionId, getToken } = useAuth();
    // const { isSignedIn, isLoaded, user } = useUser()
    // const handleUpload = async () => {
    //     try {
    //         // Loop through each file and store metadata and content
    //         for (const file of files) {
    //             // Storing metadata in Firestore
    //             const docRef = await addDoc(collection(db, 'users', user.id, 'files'), {
    //                 userId: user.id,
    //                 fileName: file.name,
    //                 size: file.size,
    //                 type: file.type,
    //                 timestamp: serverTimestamp(),
    //             });

    //             // Storing file content in Firebase Storage
    //             const storageRef = ref(storage, `users/${user.id}/files/${docRef.id}`);
    //             const uploadTask = uploadBytesResumable(storageRef, file);

    //             // Listen for state changes, including progress updates
    //             uploadTask.on('state_changed',
    //                 (snapshot) => {
    //                     const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    //                     console.log(`Upload for ${file.name} is ${progress.toFixed(2)}% done`);
    //                 },
    //                 (error) => {
    //                     console.error(`Error uploading ${file.name}:`, error);
    //                 },
    //                 async () => {
    //                     // Upload completed, update Firestore document with downloadUrl
    //                     const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
    //                     await updateDoc(doc(db, 'users', user.id, 'files', docRef.id), {
    //                         downloadUrl: downloadUrl,
    //                     });
    //                 }
    //             );
    //         }
    //     } catch (error) {
    //         console.error('Error uploading file:', error);
    //     }
    // };

    return (
        <div className="flex flex-col">
            <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div {...getRootProps()}>
                            <input {...getInputProps()} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                        </div>
                    </section>
                )}
            </Dropzone>
            <button className="bg-gray-600 text-white p-6" onClick={handleUpload}>Create</button>
        </div >
    )
}

export default Create
