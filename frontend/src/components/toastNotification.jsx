import toast from "react-hot-toast";

export const showToastWithActions = (notification, setNotifications) => {
    toast(
        (t) => (
            <div>
                <p>{notification.message}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                    <button onClick={() => handleAccept(notification, setNotifications)} style={{ background: "green", color: "white", padding: "5px", borderRadius: "5px" }}>
                        Accept
                    </button>
                    <button onClick={() => handleDecline(notification, setNotifications)} style={{ background: "red", color: "white", padding: "5px", borderRadius: "5px" }}>
                        Decline
                    </button>
                </div>
            </div>
        ),
        { duration: 6000 } // 6 seconds before auto-dismiss, can be changed
    );
};

export const handleAccept = async (notification, setNotifications) => {
    try {
        const inviteId = notification.invite_id
        console.log("invite id: ", inviteId)
        const response = await fetch(`http://localhost:5001/api/invite/accept/${inviteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });

        if (!response.ok) throw new Error("Failed to accept invite");

        toast.success("Invite accepted!");

        toast.dismiss(); // Remove toast after successful action

        // ✅ Fix: Pass setNotifications from component using the function
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));

    } catch (error) {
        console.error("Error accepting invite:", error);
        toast.error("Failed to accept invite");
    }
};

export const handleDecline = async (notification, setNotifications) => {
    try {
        const response = await fetch(`http://localhost:5001/api/invite/reject/${notification.invite_id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
        });

        if (!response.ok) throw new Error("Failed to decline invite");

        toast.success("Invite declined!");

        toast.dismiss(); // Remove toast after successful action

        // ✅ Fix: Pass setNotifications from component using the function
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));

    } catch (error) {
        console.error("Error declining invite:", error);
        toast.error("Failed to decline invite");
    }
};
