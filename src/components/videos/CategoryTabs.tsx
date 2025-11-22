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
    <div className="categories-container">
      <div className="categories-scroll">
        <ul className="categories-nav">
          {categories.map((category) => (
            <li key={category} className="category-item">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onCategorySelect(category);
                }}
                className={`category-link ${
                  selectedCategory === category ? 'active' : ''
                }`}
              >
                {category}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
