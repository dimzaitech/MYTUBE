'use client';

interface CategoryTabsProps {
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategoryTabsProps) {
  const renderTabs = (isDesktop: boolean) => {
    const navClass = isDesktop 
      ? 'desktop-nav hidden md:flex' 
      : 'overflow-x-auto scrollbar-hide md:hidden';
    const containerClass = isDesktop
      ? ''
      : 'inline-flex gap-2 px-3 md:gap-3 md:px-4';
      
    return (
      <nav className={isDesktop ? 'desktop-nav' : ''}>
         <div className={isDesktop ? 'flex gap-3' : 'inline-flex gap-2 px-3'}>
          {categories.map((category) => (
            <a
              key={category}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onCategorySelect(category);
              }}
              className={
                selectedCategory === category
                  ? 'active'
                  : ''
              }
            >
              {category}
            </a>
          ))}
        </div>
      </nav>
    )
  };

  return (
    <>
      {/* Mobile Nav */}
      <div className="md:hidden border-b border-zinc-800 py-3">
        <div className="overflow-x-auto scrollbar-hide">
            <div className="inline-flex gap-2 px-3">
            {categories.map((category) => (
                <button
                key={category}
                onClick={() => onCategorySelect(category)}
                className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-[#303030] text-white hover:bg-[#505050]'
                }`}
                >
                {category}
                </button>
            ))}
            </div>
        </div>
      </div>

      {/* Desktop Nav */}
      <div className="hidden md:block desktop-nav">
          {categories.map((category) => (
            <a
                key={category}
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onCategorySelect(category);
                }}
                className={selectedCategory === category ? 'active' : ''}
            >
                {category}
            </a>
          ))}
      </div>
    </>
  );
}
