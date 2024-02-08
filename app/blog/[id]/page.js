'use client'
import { addDoc, collection, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const page = ({ params }) => {
    const { isSignedIn, isLoaded, user } = useUser();
    const [fileInfo, setFileInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const [commentInp, setCommentInp] = useState('')
    const [num, setNum] = useState(1)

    useEffect(() => {
        const handleResize = () => {
            const screenWidth = window.innerWidth;

            if (screenWidth <= 748) {
                setNum(1);
            }
            else {
                // Laptop or desktop size
                setNum(2);
            }
        };

        // Initial call to set the initial value based on the current screen size
        handleResize();

        // Add event listener for window resize
        window.addEventListener('resize', handleResize);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setLoading(true);
        const getFileInfo = async () => {
            if (!user) return;
            try {
                const docRef = doc(db, "users", params.id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // console.log(docSnap.data())
                    setFileInfo(docSnap.data());
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching document:", error);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            getFileInfo();
        }
    }, [params.id, user]);

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

    const updateComment = async () => {
        try {
            const docRef = await addDoc(collection(db, "comments", params.id, "users_comments"), {
                id: user.id,
                fullname: user.fullName,
                comment: commentInp,
                timestamp: serverTimestamp(),
            });
            notify();
            setCommentInp("")
            // console.log("Document written with ID: ", docRef);
            // setCommentBox(docRef);
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    };

    const [allComments, setAllComments] = useState([]);

    useEffect(() => {
        const getComments = async () => {
            setLoading(true);
            try {
                const docsResult = await getDocs(collection(db, "comments", params.id, "users_comments"));
                const comments = docsResult.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setAllComments(comments);
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoading(false);
            }
        };
        if (params.id) {
            getComments();
        }
    }, [params.id]);


    return (
        <div className="w-screen flex items-center justify-center">
            {loading ? (
                <section className="dots-container w-screen h-screen">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </section>
            ) :
                (
                    <div className='w-full px-6 py-20 lg:w-[50vw] flex items-center justify-start gap-16 my-8 flex-col'>
                        {fileInfo && fileInfo.type && fileInfo.type.split('/')[0] === 'video' ? (
                            <video autoPlay muted src={fileInfo.downloadUrl} className='w-full h-[26rem] object-contain aspect-video'></video>
                        ) : (
                            fileInfo && fileInfo.downloadUrl && <img src={fileInfo.downloadUrl} alt="img" className='w-full h-[26rem] aspect-square object-contain ' />
                        )}

                        <div className='flex flex-col items-start justify-start gap-4'>
                            <h1 className="text-2xl text-[#402aff] font-bold text-center">{fileInfo.title}</h1>
                            <h2>{fileInfo.desc}</h2>
                            <h3>{fileInfo.blog}</h3>
                            <span className="w-full flex items-end justify-end">
                                <h2 className='mt-4 font-bold'>Posted by: {fileInfo.fullname}</h2>
                            </span>
                        </div>

                        <div className=" flex items-center justify-center flex-col w-screen bg-slate-400/20 px-6 py-10">
                            <h1 className="text-2xl mb-10 font-bold">Comments</h1>
                            <div className="flex w-full lg:w-[50vw] items-center justify-center">
                                <Swiper
                                    effect={'card'}
                                    grabCursor={true}
                                    slidesPerView={num}
                                    loop={true}
                                    autoplay={{
                                        delay: 2500,
                                        disableOnInteraction: false,
                                    }}
                                    modules={[Autoplay, Pagination, Navigation]}
                                    className="mySwiper"
                                >
                                    {allComments.map((comment) => (
                                        <SwiperSlide >
                                            <div className="bg-blue-500 rounded-md p-10 w-[20rem] h-[15rem] mx-8 flex items-center justify-center flex-col text-white" key={comment.id}>
                                                <h2 className="italic text-sm mb-2">"{comment.comment}"</h2>
                                                <h2 className="font-bold text-md">- {comment.fullname}</h2>
                                            </div>
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                            </div>
                        </div>


                        <span className="w-full flex items-center justify-center gap-4">
                            <input
                                type="text"
                                value={commentInp}
                                placeholder="Leave a comment"
                                onChange={(e) => { setCommentInp(e.target.value) }}
                                className="w-[20rem] outline-none border teext-sm p-3"
                            />
                            <button disabled={commentInp === ""} className="bg-[#402aff] px-4 py-2 text-white rounded-full disabled:bg-slate-400" onClick={updateComment}>
                                Comment
                            </button>
                        </span>
                    </div>
                )

            }
            <ToastContainer />
        </div>
    )
}

export default page;
