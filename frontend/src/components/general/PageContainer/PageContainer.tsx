type PageContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

function PageContainer(props: PageContainerProps) {
  return <div className="max-w-4xl m-auto">{props.children}</div>;
}

export default PageContainer;
