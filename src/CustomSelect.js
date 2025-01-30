import React, { useState, useEffect, useRef } from "react";
import "./style.css";

const ITEM_HEIGHT = 35;
const VISIBLE_ITEMS = 6;

const CustomSelect = ({ onChange }) => {
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "https://parseapi.back4app.com/classes/Names_Letter_G",
          {
            headers: {
              "X-Parse-Application-Id":
                "zsSkPsDYTc2hmphLjjs9hz2Q3EXmnSxUyXnouj1I",
              "X-Parse-Master-Key": "4LuCXgPPXXO2sU5cXm6WwpwzaKyZpo3Wpj4G4xXK",
            },
          }
        );
        const data = await response.json();
        setOptions(data.results.map((item) => item.Name));
      } catch (error) {
        console.error("Failed to fetch options", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isOpen && !!options.length) {
      setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);

      setTimeout(() => {
        scrollToIndex(selectedIndex >= 0 ? selectedIndex : 0);
      }, 10);
    }
  }, [isOpen, options.length, selectedIndex]);

  const scrollToIndex = (index) => {
    const dropdown = dropdownRef.current;
    if (!dropdown || index < 0 || index >= options.length) return;

    const itemTop = index * ITEM_HEIGHT;
    const itemBottom = itemTop + ITEM_HEIGHT;
    const currentScrollTop = dropdown.scrollTop;
    const visibleHeight = VISIBLE_ITEMS * ITEM_HEIGHT;

    //for smooth scrolling
    if (itemTop < currentScrollTop) {
      dropdown.scrollTo({
        top: itemTop,
        behavior: "smooth",
      });
    } else if (itemBottom > currentScrollTop + visibleHeight) {
      dropdown.scrollTo({
        top: itemBottom - visibleHeight,
        behavior: "smooth",
      });
    }
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
    setIsOpen(false);
    onChange?.(options[index]);
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = Math.min(prev + 1, options.length - 1);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const newIndex = Math.max(prev - 1, 0);
          scrollToIndex(newIndex);
          return newIndex;
        });
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        handleSelect(highlightedIndex);
        break;

      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;

      default:
        break;
    }
  };

  const handleScroll = (e) => setScrollTop(e.target.scrollTop);

  const startIndex = Math.floor(scrollTop / ITEM_HEIGHT);
  const endIndex = Math.min(startIndex + VISIBLE_ITEMS + 2, options.length - 1);
  const visibleOptions = options.slice(startIndex, endIndex + 1);

  return (
    <div
      className="select-container"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onBlur={() => setTimeout(() => setIsOpen(false), 100)}
      ref={containerRef}
    >
      <div className="select-box" onClick={() => setIsOpen((prev) => !prev)}>
        {selectedIndex >= 0 ? options[selectedIndex] : "Select an option"}
      </div>

      {isOpen && (
        <div
          className="select-dropdown"
          ref={dropdownRef}
          onScroll={handleScroll}
        >
          <div
            style={{
              height: options.length * ITEM_HEIGHT,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: startIndex * ITEM_HEIGHT,
                width: "100%",
              }}
            >
              {visibleOptions.map((option, i) => {
                const index = startIndex + i;
                return (
                  <div
                    key={index}
                    className={`select-option 
                      ${index === selectedIndex ? "selected" : ""}
                      ${index === highlightedIndex ? "highlighted" : ""}
                    `}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onMouseDown={() => handleSelect(index)}
                    style={{ height: ITEM_HEIGHT }}
                  >
                    {option}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
