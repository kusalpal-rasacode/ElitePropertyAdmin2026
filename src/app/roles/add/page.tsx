import AddRoleForm from "./Form";
import { PermissionGuard } from "@/components/auth/PermissionGuard";

export default function AddRolePage() {
    return (
        <PermissionGuard requireSuperAdmin>
            <AddRoleForm />
        </PermissionGuard>
    );
}
