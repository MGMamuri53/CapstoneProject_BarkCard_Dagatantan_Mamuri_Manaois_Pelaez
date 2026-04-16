export default function Header({ searchTerm, onSearchChange }) {
  return (
    <header className="sticky top-0 w-full z-40 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl flex items-center justify-between px-8 h-16">
      <div className="flex items-center gap-4 bg-surface-container px-4 py-2 rounded-lg w-96">
        <span className="material-symbols-outlined text-zinc-400 text-sm">search</span>
        <input
          className="bg-transparent border-none outline-none text-sm w-full focus:ring-0 text-on-surface"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search orders, students, or meals..."
          type="text"
          value={searchTerm}
        />
      </div>
      <div className="flex items-center gap-6">
        <button className="relative text-zinc-500 hover:text-primary transition-colors active:scale-95 transform">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
        </button>
        <div className="h-8 w-[1px] bg-zinc-200"></div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-bold font-headline leading-none">Admin Sarah</p>
            <p className="text-xs text-zinc-500 font-label">Main Canteen</p>
          </div>
          <img alt="User profile avatar" className="w-10 h-10 rounded-lg object-cover editorial-shadow" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK_oZQC4K7SHsD8zyJu_kK2YFnoE-logfttEVP0CjOcx_hksjJT7C7HFqb3LY7jA4WKnuNbGG1rw_itp9qP_fEbwe8u96G6HWjiapGtrGJFKdCtawgBcuF2swRJyStGCxL_Qx5cfgt1ktOg9k2PUrAsvFSNLidD2gG6gTiQSJZ9kug_i49_3dlazYEQ76CHH-cjR8-9319MXn7swi1msi8m3q5SuNlzWqJDnfW5KUtplmA0N9L4iWf851BqURiAkJOgVEK5ML4BpjW"/>
        </div>
      </div>
    </header>
  );
}
