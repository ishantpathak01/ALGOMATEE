import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#1e1e1e",
  color: "#fff",
  borderRadius: "10px",
  boxShadow: 24,
  p: 4,
  border: "1px solid #333",
};

export default function DarkThemeModal({ handleClose, onSave }) {
  const [sectionName, setSectionName] = React.useState("");
  const [remark, setRemark] = React.useState("");

  const handleSubmit = () => {
    if (!sectionName || !remark) {
      alert("Please fill in all fields.");
      return;
    }
    onSave({ sectionName, remark });
    handleClose();
  };

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={true}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{ backdrop: { timeout: 500 } }}
    >
      <Fade in={true}>
        <Box sx={style}>
          <Typography
            id="transition-modal-title"
            variant="h6"
            component="h2"
            className="text-center font-semibold"
          >
            Enter Details
          </Typography>

          <div className="mt-4 space-y-4">
            <TextField
              fullWidth
              label="Section Name"
              variant="outlined"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              InputProps={{
                style: {
                  color: "#fff",
                  borderColor: "#555",
                },
              }}
              InputLabelProps={{
                style: { color: "#bbb" },
              }}
              className="bg-[#222] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />

            <TextField
              fullWidth
              label="Remark (e.g., Subject Name)"
              variant="outlined"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              InputProps={{
                style: {
                  color: "#fff",
                  borderColor: "#555",
                },
              }}
              InputLabelProps={{
                style: { color: "#bbb" },
              }}
              className="bg-[#222] border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end mt-6 space-x-2">
            <Button
              variant="outlined"
              color="error"
              onClick={handleClose}
              className="border-gray-500 text-gray-300 hover:border-red-500 hover:text-red-500"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "#007bff", color: "#fff" }}
              onClick={handleSubmit}
              className="hover:bg-blue-600"
            >
              Save
            </Button>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
