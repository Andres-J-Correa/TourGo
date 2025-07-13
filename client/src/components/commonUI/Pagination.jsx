import React, { useState, useEffect } from "react";
import {
  Pagination,
  PaginationItem,
  PaginationLink,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import PropTypes from "prop-types";
import { useLanguage } from "contexts/LanguageContext"; // added

const PaginationComponent = ({
  pageIndex,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  maxPageNumbersToShow = 4,
}) => {
  const [inputValue, setInputValue] = useState(pageIndex + 1);

  const { t } = useLanguage(); // added

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputSubmit = (e) => {
    if (e.key === "Enter") {
      if (Number(inputValue) === pageIndex + 1) return;
      const page = parseInt(inputValue, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        onPageChange(page - 1);
      } else {
        setInputValue(pageIndex + 1); // Reset on invalid input
      }
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(0, pageIndex - 1);
    let endPage = Math.min(totalPages - 1, pageIndex + 2);

    if (endPage - startPage + 1 < maxPageNumbersToShow) {
      startPage = Math.max(0, endPage - maxPageNumbersToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i} active={pageIndex === i}>
          <PaginationLink onClick={() => onPageChange(i)}>
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return pages;
  };

  useEffect(() => {
    setInputValue(pageIndex + 1);
  }, [pageIndex]);

  return (
    <div className="d-flex align-items-center gap-2 float-end mb-3">
      <Pagination
        aria-label="Page navigation"
        className="pagination pagination-rounded mb-0">
        <PaginationItem disabled={pageIndex === 0}>
          <PaginationLink first onClick={() => onPageChange(0)} />
        </PaginationItem>

        <PaginationItem disabled={!hasPreviousPage}>
          <PaginationLink
            previous
            onClick={() => onPageChange(pageIndex - 1)}
          />
        </PaginationItem>

        {getPageNumbers()}

        <PaginationItem disabled={!hasNextPage}>
          <PaginationLink next onClick={() => onPageChange(pageIndex + 1)} />
        </PaginationItem>

        <PaginationItem disabled={pageIndex === totalPages - 1}>
          <PaginationLink last onClick={() => onPageChange(totalPages - 1)} />
        </PaginationItem>
      </Pagination>

      <InputGroup style={{ width: "100px" }}>
        <InputGroupText>{t("commonUI.pagination.goTo")}</InputGroupText>
        <Input
          type="number"
          min="1"
          max={totalPages}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputSubmit}
        />
      </InputGroup>
    </div>
  );
};

PaginationComponent.propTypes = {
  pageIndex: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  hasPreviousPage: PropTypes.bool.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxPageNumbersToShow: PropTypes.number,
};

export default PaginationComponent;
