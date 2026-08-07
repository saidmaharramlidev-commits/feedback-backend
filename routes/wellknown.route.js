import { Router } from "express";

const wellKnownRouter = Router();

wellKnownRouter.get("/assetlinks.json", (req, res) => {
    res.json([
        {
            relation: ["delegate_permission/common.handle_all_urls"],
            target: {
                namespace: "android_app",
                package_name: "com.saidovery.whispame",
                sha256_cert_fingerprints: [
                    "C7:2C:93:DB:19:23:68:22:C5:4D:12:06:01:2A:81:BC:F9:E2:B9:42:35:76:99:31:AD:A6:6F:6D:93:A1:C0:C9"
                ]
            }
        }
    ]);
});

export default wellKnownRouter;