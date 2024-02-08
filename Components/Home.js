import { auth } from "@clerk/nextjs";
import { collection, getDocs } from "firebase/firestore";

import Blogs from "./Blogs";
import { db } from "@/firebase";

const Home = async () => {
    const { userId } = auth();


    const docsResult = await getDocs(collection(db, 'users'))

    const skeletonFiles = docsResult.docs.map((doc) => ({
        id: doc?.id,
        filename: doc.data().filename || doc.id,
        timestamp: doc.data().timestamp?.toMillis() / 1000 || undefined,
        title: doc.data().title,
        desc: doc.data().desc,
        downloadUrl: doc.data().downloadUrl,
        type: doc.data().type,
        size: doc.data().size,
        name: doc.data().fullname,
    }));

    // console.log(skeletonFiles)

    return (
        <div className='min-h-[100svh] overflow-x-hidden flex flex-col py-12 px-6 lg:px-60'>            
            <Blogs files={skeletonFiles} />
        </div>
    )
}

export default Home
