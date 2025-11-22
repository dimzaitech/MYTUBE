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
       <div className="hidden md:flex desktop-categories">
          {categories.map((category) => (
            <a
                key={category}
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    onCategorySelect(category);
                }}
                className={`desktop-category ${selectedCategory === category ? 'active' : ''}`}
            >
                {category}
            </a>
          ))}
      </div>
    </>
  );
}
