export default function Loading(){
   return(
      <>
      <div className="w-full h-full flex justify-center items-center">
         <div>
            <div className="h-16 w-16 rounded-full border-4 border-t-pink-500 border-r-pink-500 border-b-transparent border-l-transparent animate-spin"></div>
            <p className="mt-4">Loading...</p>
         </div>
      </div> 
      </>
   );
}