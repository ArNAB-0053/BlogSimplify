'use client'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link';

const Blogs = ({ files }) => {
    const user = useUser();
    return (
        <div className='w-full h-full'>
            {files.map((e, index) => (
                <Link href={`/blog/${e.id}`} className='w-full flex items-center justify-start gap-4 my-16 flex-col lg:flex-row border shadow-md' key={index}>
                    {e.type.split('/')[0] === 'video' ? (
                        <video autoPlay muted src={e.downloadUrl} className='w-full lg:min-w-[40vw] lg:max-w-[40vw] object-cover aspect-[16/9] border'></video>
                    ) : (
                        <img src={e.downloadUrl} alt="img" className='w-full lg:w-[40vw] object-cover aspect-[16/9] border' />
                    )}

                    <div className='flex flex-col items-start justify-start gap-4 relative p-3'>
                        <h1 className="text-xl font-bold text-[#402aff]">{e.title}</h1>
                        <h2 className='text-black/70'>{e.desc}</h2>
                        <span className='w-full flex items-end justify-end ml-[-3rem]'>
                            <h2 className='mt-4 flex items-start justify-start flex-col'><strong>Posted by:</strong> {e.name}</h2>
                        </span>
                    </div>
                </Link>
            ))}
        </div>
    )
}

export default Blogs
