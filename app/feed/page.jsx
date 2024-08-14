import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Header from "@/components/Header";
import PostForm from "@/components/PostForm";

export default async function Feed() {

  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <html lang="en">

      <body className="min-h-screen flex flex-col">

        <header className="border-b sticky top-0 bg-white z-50">
          <Header />
        </header>

        <div className="grid grid-cols-8 mt-5 sm:px-5">
          <section className="hidden md:inline md:col-span-2">
            {/* <UserInformation posts={posts}/> */}
          </section>

          <section className="col-span-full md:col-span-6 xl:col-span-4 xl:max-w-xl mx-auto w-full">
              <PostForm />
            
            {/* <PostFeed
              posts={posts}
            /> */}

          </section>

          <section className="hidden xl:inline justify-center col-span-2">
            {/* <Widget /> */}
          </section>

        </div>

      </body>

    </html>

  );
}