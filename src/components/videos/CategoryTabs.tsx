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

  // This component now only renders the mobile category bar.
  // The desktop version is handled directly in page.tsx for layout simplicity.
  return (
    <>
      {/* Mobile-only Category Bar */}
      <div className="mobile-categories md:hidden">
        {categories.map((category) => (
          <a
            key={category}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onCategorySelect(category);
            }}
            className={`mobile-category ${
              selectedCategory === category ? 'active' : ''
            }`}
          >
            {category}
          </a>
        ))}
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
