import SidebarDashboard from "@/components/SidebarDashboard";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SidebarDashboard>{children}</SidebarDashboard>;
}
