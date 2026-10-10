# IKOI: GitHub + Vercel

This is the static public website only. It contains no admin page, password, or server API. content.json is copied from the latest locally published CMS content.

1. Create a new GitHub repository, for example ikoi-site. Do not overwrite the previous coffee stand repository.
2. Upload the contents of this directory. index.html and vercel.json must be at the repository root, with assets as a directory. Do not upload only the ZIP file.
3. In Vercel choose Add New > Project, import this GitHub repository, and choose Other as the framework. Keep Root Directory at the repository root. No build command is needed; output directory is . (configured in vercel.json).
4. Deploy and check the assigned HTTPS URL on mobile and desktop.

To update menu or shop information, edit content.json in GitHub and commit. Connected Vercel deployments update automatically. The local CMS does not update this static deployment.

Before treating this as an operating shop's official site, confirm LINE URL, address, nearest station, phone, menu/prices, payment brands, and accuracy of generated interior images. Missing LINE URL displays a preparation notice.
