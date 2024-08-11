// import Image from "next/image";
// import Link from "next/link";

// export default function Home() {
//   return (
//     <main className="flex min-h-screen flex-col items-center justify-between p-24">
//       <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
//         <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
//           Get started by connecting with your community
//         </p>
//       </div>

//       <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-full sm:before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full sm:after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px] z-[-1]">
//         <Image
//           className=""
//           src="https://linkedinsdi2100043.blob.core.windows.net/icons/welcome_logo_light.jpg"
//           alt="Welcome Logo"
//           width={400}
//           height={400}
//           priority
//         />
//       </div>

//       <div className="flex flex-row items-center justify-center mb-32 space-x-4 lg:max-w-5xl lg:w-full lg:mb-0 lg:text-left">
//         <Link
//           href="/signup"
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Sign Up
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             If you are new here!
//           </p>
//         </Link>

//         <Link
//           href={"/signin"}
//           className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
//         >
//           <h2 className={`mb-3 text-2xl font-semibold`}>
//             Sign In
//           </h2>
//           <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
//             If you already have an account!
//           </p>
//         </Link>
//       </div>

//       <div className=" mt-5 z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
//         <p className="fixed left-0 bottom-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 ">
//           From the makers of&nbsp;
//           <Image
//             className=""
//             src="https://linkedinsdi2100043.blob.core.windows.net/icons/end_logo_light.jpg"
//             alt="WorkWave"
//             width={100}
//             height={20}
//             priority
//           />
//         </p>
//       </div>
//     </main>
//   );
// }
import Link from 'next/link';
import styles from '../styles/Home.module.css';


const WelcomePage = () => {

  return (
    <div className={styles.container}>
      <div className={styles.backgroundGraphic}></div>
      <h1 className={styles.header}>Welcome to WorkWave!</h1>
      <div className={styles.blocksContainer}>
        <Link href="/signin">
          <div className={styles.link}>
            <div className={styles.block}>
              <h2 className={styles.blockHeader}>Sign In</h2>
            </div>
          </div>
        </Link>
        <Link href="/signup">
          <div className={styles.link}>
            <div className={styles.block}>
              <h2 className={styles.blockHeader}>Sign Up</h2>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default WelcomePage;

