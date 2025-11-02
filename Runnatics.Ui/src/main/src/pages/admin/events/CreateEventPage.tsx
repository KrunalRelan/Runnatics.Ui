import { useParams } from "react-router-dom";
import { CreateEvent } from "../../../components/events/CreateEvent";
    //"../../components/events/CreateEventForm";
//import { useAuthStore } from "../../stores/auth.store";

export const CreateEventPage = () => {
  const { organizationId } = useParams<{ organizationId: string }>();
  //const { user } = useAuthStore();

  // If organizationId is not in URL, use the current user's organization
  const orgId = organizationId
    ? parseInt(organizationId)
    : 0
    //: user?.organizationId || 0;

  if (!orgId) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Unable to determine organization. Please select an organization
            first.
          </p>
        </div>
      </div>
    );
  }

  return <CreateEvent organizationId={orgId} />;
};
