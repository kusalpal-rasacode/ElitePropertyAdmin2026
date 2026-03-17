import AddUserForm from "./Form";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function AddUserPage() {
    return (
        <PermissionGuard module="user_management" action="add">
            <AddUserForm />
        </PermissionGuard>
    );
}
