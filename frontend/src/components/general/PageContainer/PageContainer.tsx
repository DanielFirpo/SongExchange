type PageContainerProps = {
  children: React.ReactNode; //👈 children prop typr
};

function PageContainer(props: PageContainerProps) {
  return <>{props.children}</>;
}

export default PageContainer;
