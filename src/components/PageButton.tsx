import React from "react";

type PageButtonProps = {
  name: string;
  isBold: boolean;
};

const PageButton = ({ name, isBold }: PageButtonProps) => {
  return (
    <div className="btn">
      <span className={isBold ? "pageButtonBold hoverBold" : "hoverBold"}>
        {name}
      </span>
    </div>
  );
};

export default PageButton;
