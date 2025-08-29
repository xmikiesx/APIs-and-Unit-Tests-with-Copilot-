// Simulated database of users
const usersDatabase = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "user" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "user" },
  { id: 4, name: "Alice Wilson", email: "alice@example.com", role: "admin" },
  { id: 5, name: "Charlie Brown", email: "charlie@example.com", role: "user" },
  { id: 6, name: "Diana Prince", email: "diana@example.com", role: "admin" },
  { id: 7, name: "Eva Green", email: "eva@example.com", role: "user" },
  { id: 8, name: "Frank Miller", email: "frank@example.com", role: "user" },
  { id: 9, name: "Grace Lee", email: "grace@example.com", role: "admin" },
  { id: 10, name: "Henry Ford", email: "henry@example.com", role: "user" },
  { id: 11, name: "Ivy Chen", email: "ivy@example.com", role: "user" },
  { id: 12, name: "Jack Black", email: "jack@example.com", role: "admin" },
  { id: 13, name: "Kate Stone", email: "kate@example.com", role: "user" },
  { id: 14, name: "Leo Martinez", email: "leo@example.com", role: "user" },
  { id: 15, name: "Maya Patel", email: "maya@example.com", role: "admin" },
];

// Copilot can help auto-suggest function structure:
exports.createUser = (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Missing fields" });

  // Generate a new ID (in a real app, this would come from the database)
  const newId =
    usersDatabase.length > 0
      ? Math.max(...usersDatabase.map((u) => u.id)) + 1
      : 1;

  // Create new user object
  const newUser = {
    id: newId,
    name,
    email,
    role: "user", // Default role for new users
  };

  // Add to simulated database (in a real app, save to actual database)
  usersDatabase.push(newUser);

  // Return success response with user ID
  res.status(201).json({
    message: "User created successfully",
    data: newUser,
  });
};

exports.getUser = (req, res) => {
  const { id } = req.params;
  // Mock response for demo
  res.status(200).json({ id, name: "Demo User", email: "demo@example.com" });
};

/**
 * GET /users - List users with pagination and filters
 * Query parameters:
 * - limit: number of users per page (default: 10, max: 100)
 * - offset: number of users to skip (default: 0)
 * - role: filter by role ('admin' or 'user')
 */
exports.getAllUsers = (req, res) => {
  try {
    // Extract query parameters with defaults
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 users per page
    const offset = parseInt(req.query.offset) || 0;
    const roleFilter = req.query.role;

    // Validate role filter if provided
    if (roleFilter && !["admin", "user"].includes(roleFilter)) {
      return res.status(400).json({
        error: "Invalid role filter",
        message: "Role must be either 'admin' or 'user'",
      });
    }

    // Apply role filter if specified
    let filteredUsers = usersDatabase;
    if (roleFilter) {
      filteredUsers = usersDatabase.filter((user) => user.role === roleFilter);
    }

    // Calculate total count for pagination metadata
    const totalCount = filteredUsers.length;
    const totalPages = Math.ceil(totalCount / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    // Apply pagination
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    // Build pagination metadata
    const pagination = {
      currentPage,
      totalPages,
      totalCount,
      limit,
      offset,
      hasNext: offset + limit < totalCount,
      hasPrevious: offset > 0,
    };

    // Build response
    const response = {
      success: true,
      data: paginatedUsers,
      pagination,
      filters: {
        role: roleFilter || null,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      error: "Internal server error",
      message: "An error occurred while fetching users",
    });
  }
};
