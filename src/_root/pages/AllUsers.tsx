import { useEffect, useState } from "react";
import { getAllUsers } from "@/lib/Appwrite/Api";
import { useUserContext } from "@/Context/useAuthContext";
import type { Models } from "appwrite";
import UserCard from "@/components/shared/UserCard";
import Loader from "@/components/shared/Loader";

type UserType = Models.Document & {
  name: string;
  username: string;
  imageUrl: string;
  bio?: string;
};

const AllUsers = () => {
  const { user: currentUser } = useUserContext();
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        const filtered = (data as unknown as UserType[]).filter(
          (u) => u.$id !== currentUser.$id
        );
        setUsers(filtered);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [currentUser.$id]);

  const filteredUsers = searchValue
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          u.username.toLowerCase().includes(searchValue.toLowerCase())
      )
    : users;

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader /> 
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-scroll py-10 px-5 md:p-14 custom-scrollbar">
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-6">

        {/* HEADER */}
        <div className="flex flex-col gap-1">
          <h2 className="h3-bold md:h2-bold">All People</h2>
          <p className="text-light-3 text-sm">Discover and connect with others</p>
        </div>

        {/* SEARCH */}
        <div className="flex gap-3 items-center bg-dark-3 rounded-xl px-4 py-3 w-full">
          <img src="/assets/icons/search.svg" alt="search" className="w-5 h-5 opacity-60" />
          <input
            type="text"
            placeholder="Search by name or username..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="bg-transparent text-white outline-none w-full text-sm placeholder:text-light-4"
          />
          {searchValue && (
            <button onClick={() => setSearchValue("")}>
              <img src="/assets/icons/close.svg" alt="clear" className="w-4 h-4 opacity-60 hover:opacity-100 transition" />
            </button>
          )}
        </div>

        {/* COUNT */}
        <p className="text-light-3 text-sm">
          {filteredUsers.length} {filteredUsers.length === 1 ? "person" : "people"}
        </p>

        {/* USERS GRID */}
        {filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center mt-10 gap-3">
            <img src="/assets/icons/people.svg" alt="no users" className="w-16 h-16 opacity-20" />
            <p className="text-light-4 text-center">No users found</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user: UserType) => (
              <li key={user.$id}>
                <UserCard user={user} /> 
              </li>
            ))}
          </ul>
        )}

      </div>
    </div>
  );
};

export default AllUsers;