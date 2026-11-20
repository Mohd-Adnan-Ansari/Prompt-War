import os
import sys

def create_shortcut():
    desktop_path = r"C:\Users\sandal firdaus\OneDrive\Desktop"
    if not os.path.exists(desktop_path):
        desktop_path = os.path.expanduser("~/Desktop")

    target_bat = r"C:\Users\sandal firdaus\OneDrive\Desktop\Prompt War\Start_CrisisAI.bat"
    working_dir = r"C:\Users\sandal firdaus\OneDrive\Desktop\Prompt War"
    shortcut_path = os.path.join(desktop_path, "CrisisAI.lnk")

    print(f"Target batch file: {target_bat}")
    print(f"Destination shortcut: {shortcut_path}")

    try:
        import win32com.client
        shell = win32com.client.Dispatch("WScript.Shell")
        shortcut = shell.CreateShortCut(shortcut_path)
        shortcut.TargetPath = target_bat
        shortcut.WorkingDirectory = working_dir
        shortcut.Description = "CrisisAI - Multi-Agent Crisis Command Centre"

        # Try to find Chrome icon or shell icon
        chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        if os.path.exists(chrome_path):
            shortcut.IconLocation = f"{chrome_path},0"
        else:
            shortcut.IconLocation = r"%SystemRoot%\System32\shell32.dll,220"

        shortcut.Save()
        print(f"Shortcut created successfully at: {shortcut_path}")
        return True
    except Exception as e:
        print(f"Error creating shortcut via win32com: {e}")
        return False

if __name__ == "__main__":
    create_shortcut()
