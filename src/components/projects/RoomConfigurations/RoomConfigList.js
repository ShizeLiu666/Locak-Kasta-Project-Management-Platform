import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  CardTitle,
  CardBody,
  Button
} from "reactstrap";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteRoomConfigModal from "./DeleteRoomConfigModal";
import Steps from "./form-steps/Steps";
import {
  renderDevicesTable,
  renderGroupsTable,
  renderScenesTable,
  renderRemoteControlsTable
} from './ConfigTables';

const RoomConfigList = ({ roomTypeName, projectRoomId }) => {
  const [config, setConfig] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [alert, setAlert] = useState({
    open: false,
    severity: "",
    message: "",
  });
  const [showSteps, setShowSteps] = useState(false);
  const [jsonResult, setJsonResult] = useState("");
  const [file, setFile] = useState(null);

  // 获取 room 的详细信息，包括 config
  const fetchRoomDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/project-rooms/detail/${projectRoomId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await response.json();
      // console.log("API response data:", data);
      
      if (data.success && data.data) {
        // console.log("Raw config:", data.data.config);
        // console.log("Config type:", typeof data.data.config);
        
        let parsedConfig;
        if (typeof data.data.config === 'string') {
          try {
            parsedConfig = JSON.parse(data.data.config);
          } catch (e) {
            // console.error("Error parsing config:", e);
            parsedConfig = data.data.config;
          }
        } else {
          parsedConfig = data.data.config;
        }
        
        // console.log("Parsed config:", parsedConfig);
        setConfig(parsedConfig);
      } else {
        console.error(`Error fetching room details: ${data.errorMsg}`);
      }
    } catch (error) {
      console.error("Error fetching room details:", error);
    }
  }, [projectRoomId]);

  const submitJson = async (jsonResult, isReplace = false) => {
    if (!jsonResult) {
      setAlert({
        severity: "error",
        message: "JSON content is empty",
        open: true,
      });
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/project-rooms/${projectRoomId}/config`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: jsonResult,
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAlert({
            severity: "success",
            message: isReplace
              ? "Configuration replaced successfully."
              : "JSON configuration submitted successfully.",
            open: true,
          });

          // Fetch updated room configuration after successful submission
          fetchRoomDetail();

          // 切换回配置显示
          setShowSteps(false);
        } else {
          setAlert({
            severity: "error",
            message: `Failed to submit JSON configuration: ${data.errorMsg}`,
            open: true,
          });
        }
      } else {
        setAlert({
          severity: "error",
          message: "Failed to submit JSON configuration",
          open: true,
        });
      }

      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    } catch (error) {
      setAlert({
        severity: "error",
        message: "An error occurred while submitting JSON",
        open: true,
      });
    }
  };

  useEffect(() => {
    fetchRoomDetail();
  }, [projectRoomId, fetchRoomDetail]);

  // 处理 CloudUploadIcon 点击事件
  const handleCloudUploadClick = () => {
    setShowSteps(true);
  };

  // 保留其他函数，但不在此处显示它们的实现

  const handleDeleteConfig = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/project-rooms/clear-config/${projectRoomId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setConfig(null);
        setAlert({
          severity: "success",
          message: "Room configuration deleted successfully.",
          open: true,
        });
        setJsonResult("");
        setFile(null);
        if (document.getElementById("exampleFile")) {
          document.getElementById("exampleFile").value = null;
        }
      } else {
        const errorData = await response.json();
        setAlert({
          severity: "error",
          message: `Error deleting room configuration: ${errorData.errorMsg}`,
          open: true,
        });
      }

      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    } catch (error) {
      setAlert({
        severity: "error",
        message: "An error occurred while deleting the room configuration.",
        open: true,
      });
      setTimeout(() => {
        setAlert({ open: false });
      }, 3000);
    }

    setDeleteModalOpen(false);
  };

  const handleDownloadJson = () => {
    if (config) {
      const jsonString = JSON.stringify(config, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${roomTypeName}_configuration.json`;
      link.click();
    }
  };

  return (
    <Row>
      {/* Alert Component */}
      {alert.open && (
        <Alert
          severity={alert.severity}
          style={{
            position: "fixed",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
          }}
        >
          {alert.message}
        </Alert>
      )}

      <Col>
        <Card>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            className="border-bottom p-3 mb-0"
          >
            <Box display="flex" alignItems="center">
              <CardTitle tag="h5" style={{ marginBottom: 0, marginRight: "10px" }}>
                <b>{roomTypeName}</b>
              </CardTitle>
              {config && config !== "{}" && Object.keys(config).length > 0 && (
                <Button
                  color="secondary"
                  onClick={handleDownloadJson}
                  size="sm"
                  style={{marginTop:"2px", marginLeft:"5px", display: "flex", alignItems: "center"}}
                >
                  <CloudDownloadIcon style={{ marginRight: "8px" }} />
                  <span style={{ position: "relative", top: "1px" }}>Download JSON</span>
                </Button>
              )}
            </Box>

            <Box display="flex" alignItems="center">
              <Button
                color="success"
                onClick={handleCloudUploadClick}
                size="sm"
                style={{ marginRight: "10px", backgroundColor: "#007bff", borderColor: "#007bff" }}
              >
                <CloudUploadIcon style={{ marginRight: "8px" }} />
                Upload / Overwrite
              </Button>
              {config && config !== "{}" && Object.keys(config).length > 0 && (
                <Button
                  color="danger"
                  onClick={() => setDeleteModalOpen(true)}
                  size="sm"
                >
                  <DeleteForeverIcon style={{ marginRight: "8px" }} />
                  Delete
                </Button>
              )}
            </Box>
          </Box>

          <CardBody>
            {showSteps ? (
              <Steps
                projectRoomId={projectRoomId}
                submitJson={submitJson}
              />
            ) : (
              <>
                {config && config !== "{}" && (
                  <>
                    {/* {console.log("config:", config)}
                    {config.devices && console.log("Devices:", config.devices)} */}
                    {config.devices && renderDevicesTable(config.devices)}
                    {config.groups && renderGroupsTable(config.groups)}
                    {config.scenes && renderScenesTable(config.scenes)}
                    {config.remoteControls && renderRemoteControlsTable(config.remoteControls)}
                  </>
                )}
              </>
            )}
          </CardBody>
        </Card>

        <DeleteRoomConfigModal
          isOpen={deleteModalOpen}
          toggle={() => setDeleteModalOpen(!deleteModalOpen)}
          onDelete={handleDeleteConfig}
        />
      </Col>
    </Row>
  );
};

export default RoomConfigList;