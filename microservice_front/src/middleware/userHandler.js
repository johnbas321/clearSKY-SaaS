export const checkLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    res.render("error", {
      user: "",
      error: "You need to be logged in to view this page",
    });
    return;
  }
  next();
};

export const checkNotLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    res.render("error", {
      user: req.session.name,
      error: "You are already logged in",
    });
    return;
  }
  next();
};

export function checkRole(expectedRole) {
  return (req, res, next) => {
    const user = {
      name: req.session.name,
      email: req.session.email,
      role: req.session.role,
    };
    if (expectedRole !== user.role) {
      res.render("error", {
        user: user,
        error: "You are not authorized to view this",
      });
      return;
    }
    next();
  };
}
