import { getAllAdmins } from "@/lib/actions/admin.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminForm from "../components/AdminForm";
import AdminTable from "../components/AdminTable";
import { Button } from "@/components/ui/button";
import { requireDashboardRole } from "@/lib/auth/admin";

const Page = async () => {
  const { userId } = await requireDashboardRole(["Admin"]);

  const admins = await getAllAdmins();

  return (
    <>
      <section className="py-2 md:py-5">
        <Dialog>
          <div className="wrapper flex flex-wrap justify-between items-center">
            <h3 className="text-3xl font-bold text-center sm:text-left">
              All Admins
            </h3>
            <DialogTrigger asChild>
              <Button size="lg" className="rounded-full">
                Create Admin
              </Button>
            </DialogTrigger>
          </div>

          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create New Admin</DialogTitle>
              <DialogDescription>
                Use this form to create a new admin account within the system.
                Fill out all required fields accurately to ensure proper setup
                and access permissions for the new admin.
              </DialogDescription>
            </DialogHeader>
            <div className="py-5">
              <AdminForm userId={userId} type="Create" />
            </div>
          </DialogContent>
        </Dialog>
      </section>

      <div className="wrapper my-8">
        <AdminTable admins={admins} />
      </div>
    </>
  );
};

export default Page;
