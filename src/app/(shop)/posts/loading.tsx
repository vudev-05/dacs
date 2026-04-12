export default function PostsLoading() {
 return (
 <div className="w-full px-4 sm:px-6 lg:px-[6%] mx-autopy-8 animate-pulse">
 <div className="h-8 bg-gray-200 rounded w-56 mb-8" />
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {[1, 2, 3, 4, 5, 6].map((i) => (
 <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
 <div className="w-full h-48 bg-gray-200" />
 <div className="p-4 space-y-3">
 <div className="h-3 bg-gray-200 rounded w-24" />
 <div className="h-5 bg-gray-200 rounded w-full" />
 <div className="h-4 bg-gray-200 rounded w-3/4" />
 <div className="h-3 bg-gray-200 rounded w-1/3" />
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}
