#!/usr/bin/env python3
"""
Diploma Batch Generator - Windows Desktop Application
Generates customized diploma images with variable text from input files (TXT, CSV, XLSX)
"""

import tkinter as tk
from tkinter import ttk, filedialog, messagebox, font
from PIL import Image, ImageDraw, ImageFont
import pandas as pd
import os
import csv


class DiplomaGeneratorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Diploma Batch Generator")
        self.root.geometry("1200x800")
        
        # Variables
        self.template_image = None
        self.template_path = None
        self.data_file_path = None
        self.output_folder = None
        self.text_positions = []  # List of position configurations
        
        self.setup_ui()
        
    def setup_ui(self):
        """Setup the main user interface"""
        # Main container
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configure grid weights
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(0, weight=1)
        main_frame.rowconfigure(3, weight=1)
        
        # Title
        title_label = ttk.Label(main_frame, text="Diploma Batch Generator", 
                               font=('Helvetica', 16, 'bold'))
        title_label.grid(row=0, column=0, pady=(0, 20))
        
        # Section 1: Template Image
        template_frame = ttk.LabelFrame(main_frame, text="1. Template Image", padding="10")
        template_frame.grid(row=1, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        template_frame.columnconfigure(1, weight=1)
        
        ttk.Label(template_frame, text="Select diploma template:").grid(row=0, column=0, sticky=tk.W)
        self.template_path_var = tk.StringVar()
        ttk.Entry(template_frame, textvariable=self.template_path_var, width=50).grid(row=0, column=1, padx=(10, 10), sticky=(tk.W, tk.E))
        ttk.Button(template_frame, text="Browse...", command=self.browse_template).grid(row=0, column=2)
        
        # Image preview
        self.preview_canvas = tk.Canvas(template_frame, height=200, bg='lightgray')
        self.preview_canvas.grid(row=1, column=0, columnspan=3, pady=(10, 0), sticky=(tk.W, tk.E))
        
        # Section 2: Data File
        data_frame = ttk.LabelFrame(main_frame, text="2. Data File (TXT/CSV/XLSX)", padding="10")
        data_frame.grid(row=2, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        data_frame.columnconfigure(1, weight=1)
        
        ttk.Label(data_frame, text="Select data file:").grid(row=0, column=0, sticky=tk.W)
        self.data_path_var = tk.StringVar()
        ttk.Entry(data_frame, textvariable=self.data_path_var, width=50).grid(row=0, column=1, padx=(10, 10), sticky=(tk.W, tk.E))
        ttk.Button(data_frame, text="Browse...", command=self.browse_data).grid(row=0, column=2)
        
        # Data preview
        ttk.Label(data_frame, text="Data Preview:").grid(row=1, column=0, sticky=tk.W, pady=(10, 0))
        self.data_preview = ttk.Treeview(data_frame, columns=("col1", "col2", "col3"), show="headings", height=5)
        self.data_preview.heading("col1", text="Field 1")
        self.data_preview.heading("col2", text="Field 2")
        self.data_preview.heading("col3", text="Field 3")
        self.data_preview.grid(row=2, column=0, columnspan=3, pady=(5, 0), sticky=(tk.W, tk.E))
        
        # Section 3: Text Fields Configuration
        fields_frame = ttk.LabelFrame(main_frame, text="3. Text Fields Configuration (3 customizable fields)", padding="10")
        fields_frame.grid(row=3, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        fields_frame.columnconfigure(0, weight=1)
        fields_frame.columnconfigure(1, weight=1)
        fields_frame.columnconfigure(2, weight=1)
        
        self.field_configs = []
        for i in range(3):
            field_frame = ttk.LabelFrame(fields_frame, text=f"Field {i+1}", padding="5")
            field_frame.grid(row=0, column=i, sticky=(tk.W, tk.E), padx=5)
            field_frame.columnconfigure(1, weight=1)
            
            # Enable checkbox
            enabled_var = tk.BooleanVar(value=True)
            ttk.Checkbutton(field_frame, text="Enabled", variable=enabled_var).grid(row=0, column=0, columnspan=3, sticky=tk.W)
            
            # Position X
            ttk.Label(field_frame, text="X Position:").grid(row=1, column=0, sticky=tk.W, pady=(5, 0))
            x_var = tk.StringVar(value="100")
            ttk.Entry(field_frame, textvariable=x_var, width=8).grid(row=1, column=1, sticky=tk.W, padx=(5, 0))
            
            # Position Y
            ttk.Label(field_frame, text="Y Position:").grid(row=2, column=0, sticky=tk.W, pady=(5, 0))
            y_var = tk.StringVar(value="100")
            ttk.Entry(field_frame, textvariable=y_var, width=8).grid(row=2, column=1, sticky=tk.W, padx=(5, 0))
            
            # Font
            ttk.Label(field_frame, text="Font:").grid(row=3, column=0, sticky=tk.W, pady=(5, 0))
            font_var = tk.StringVar(value="Arial")
            font_combo = ttk.Combobox(field_frame, textvariable=font_var, width=12, values=self.get_available_fonts())
            font_combo.grid(row=3, column=1, sticky=tk.W, padx=(5, 0))
            
            # Font Size
            ttk.Label(field_frame, text="Size:").grid(row=4, column=0, sticky=tk.W, pady=(5, 0))
            size_var = tk.StringVar(value="24")
            ttk.Entry(field_frame, textvariable=size_var, width=8).grid(row=4, column=1, sticky=tk.W, padx=(5, 0))
            
            # Alignment
            ttk.Label(field_frame, text="Alignment:").grid(row=5, column=0, sticky=tk.W, pady=(5, 0))
            align_var = tk.StringVar(value="left")
            align_combo = ttk.Combobox(field_frame, textvariable=align_var, width=12, values=["left", "center", "right"])
            align_combo.grid(row=5, column=1, sticky=tk.W, padx=(5, 0))
            
            # Color
            ttk.Label(field_frame, text="Color:").grid(row=6, column=0, sticky=tk.W, pady=(5, 0))
            color_var = tk.StringVar(value="#000000")
            ttk.Entry(field_frame, textvariable=color_var, width=8).grid(row=6, column=1, sticky=tk.W, padx=(5, 0))
            ttk.Button(field_frame, text="Pick", command=lambda v=color_var: self.pick_color(v)).grid(row=6, column=2, padx=(5, 0))
            
            self.field_configs.append({
                'enabled': enabled_var,
                'x': x_var,
                'y': y_var,
                'font': font_var,
                'size': size_var,
                'align': align_var,
                'color': color_var
            })
        
        # Section 4: Output
        output_frame = ttk.LabelFrame(main_frame, text="4. Output", padding="10")
        output_frame.grid(row=4, column=0, sticky=(tk.W, tk.E), pady=(0, 10))
        output_frame.columnconfigure(1, weight=1)
        
        ttk.Label(output_frame, text="Output folder:").grid(row=0, column=0, sticky=tk.W)
        self.output_path_var = tk.StringVar()
        ttk.Entry(output_frame, textvariable=self.output_path_var, width=50).grid(row=0, column=1, padx=(10, 10), sticky=(tk.W, tk.E))
        ttk.Button(output_frame, text="Browse...", command=self.browse_output).grid(row=0, column=2)
        
        # Generate Button
        generate_frame = ttk.Frame(main_frame)
        generate_frame.grid(row=5, column=0, pady=(10, 0))
        
        self.generate_btn = ttk.Button(generate_frame, text="GENERATE DIPLOMAS", command=self.generate_diplomas)
        self.generate_btn.pack(side=tk.LEFT, padx=(0, 10))
        
        self.progress_var = tk.StringVar(value="Ready")
        ttk.Label(generate_frame, textvariable=self.progress_var).pack(side=tk.LEFT)
        
        # Progress bar
        self.progress_bar = ttk.Progressbar(generate_frame, mode='determinate', length=300)
        self.progress_bar.pack(side=tk.LEFT, padx=(10, 0))
    
    def get_available_fonts(self):
        """Get list of available fonts"""
        return sorted(list(set(font.families())))
    
    def browse_template(self):
        """Browse for template image"""
        filepath = filedialog.askopenfilename(
            title="Select Template Image",
            filetypes=[("Image files", "*.png *.jpg *.jpeg *.bmp *.tiff *.gif")]
        )
        if filepath:
            self.template_path = filepath
            self.template_path_var.set(filepath)
            self.load_template_preview()
    
    def load_template_preview(self):
        """Load and display template image preview"""
        if self.template_path:
            try:
                self.template_image = Image.open(self.template_path)
                # Resize for preview
                preview_img = self.template_image.copy()
                preview_img.thumbnail((800, 200))
                
                # Convert to PhotoImage
                from PIL import ImageTk
                self.preview_photo = ImageTk.PhotoImage(preview_img)
                
                self.preview_canvas.delete("all")
                self.preview_canvas.create_image(0, 0, anchor=tk.NW, image=self.preview_photo)
                self.preview_canvas.config(width=preview_img.width, height=preview_img.height)
            except Exception as e:
                messagebox.showerror("Error", f"Failed to load image: {str(e)}")
    
    def browse_data(self):
        """Browse for data file"""
        filepath = filedialog.askopenfilename(
            title="Select Data File",
            filetypes=[
                ("Text files", "*.txt"),
                ("CSV files", "*.csv"),
                ("Excel files", "*.xlsx *.xls"),
                ("All files", "*.*")
            ]
        )
        if filepath:
            self.data_file_path = filepath
            self.data_path_var.set(filepath)
            self.load_data_preview()
    
    def load_data_preview(self):
        """Load and preview data from file"""
        try:
            # Clear existing items
            for item in self.data_preview.get_children():
                self.data_preview.delete(item)
            
            # Load data based on file type
            ext = os.path.splitext(self.data_file_path)[1].lower()
            
            if ext == '.txt':
                with open(self.data_file_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()[:5]  # Preview first 5 lines
                    for line in lines:
                        parts = line.strip().split(',')
                        while len(parts) < 3:
                            parts.append('')
                        self.data_preview.insert('', 'end', values=parts[:3])
            
            elif ext in ['.csv']:
                df = pd.read_csv(self.data_file_path)
                for _, row in df.head(5).iterrows():
                    values = [str(v) for v in row.values[:3]]
                    while len(values) < 3:
                        values.append('')
                    self.data_preview.insert('', 'end', values=values)
            
            elif ext in ['.xlsx', '.xls']:
                df = pd.read_excel(self.data_file_path)
                for _, row in df.head(5).iterrows():
                    values = [str(v) for v in row.values[:3]]
                    while len(values) < 3:
                        values.append('')
                    self.data_preview.insert('', 'end', values=values)
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load data file: {str(e)}")
    
    def browse_output(self):
        """Browse for output folder"""
        folderpath = filedialog.askdirectory(title="Select Output Folder")
        if folderpath:
            self.output_folder = folderpath
            self.output_path_var.set(folderpath)
    
    def pick_color(self, var):
        """Open color picker"""
        from tkinter import colorchooser
        current_color = var.get()
        color = colorchooser.askcolor(color=current_color, title="Choose Text Color")
        if color[1]:
            var.set(color[1])
    
    def load_data(self):
        """Load all data from file"""
        if not self.data_file_path:
            raise ValueError("No data file selected")
        
        ext = os.path.splitext(self.data_file_path)[1].lower()
        
        if ext == '.txt':
            with open(self.data_file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
                data = []
                for line in lines:
                    parts = line.strip().split(',')
                    while len(parts) < 3:
                        parts.append('')
                    data.append(parts[:3])
                return data
        
        elif ext in ['.csv']:
            df = pd.read_csv(self.data_file_path)
            data = []
            for _, row in df.iterrows():
                values = [str(v) if pd.notna(v) else '' for v in row.values[:3]]
                while len(values) < 3:
                    values.append('')
                data.append(values)
            return data
        
        elif ext in ['.xlsx', '.xls']:
            df = pd.read_excel(self.data_file_path)
            data = []
            for _, row in df.iterrows():
                values = [str(v) if pd.notna(v) else '' for v in row.values[:3]]
                while len(values) < 3:
                    values.append('')
                data.append(values)
            return data
        
        raise ValueError(f"Unsupported file type: {ext}")
    
    def generate_diplomas(self):
        """Generate all diploma images"""
        # Validate inputs
        if not self.template_path:
            messagebox.showerror("Error", "Please select a template image")
            return
        
        if not self.data_file_path:
            messagebox.showerror("Error", "Please select a data file")
            return
        
        if not self.output_folder:
            messagebox.showerror("Error", "Please select an output folder")
            return
        
        try:
            # Load data
            data = self.load_data()
            total = len(data)
            
            if total == 0:
                messagebox.showwarning("Warning", "No data found in file")
                return
            
            self.generate_btn.config(state='disabled')
            self.progress_var.set(f"Processing: 0/{total}")
            self.progress_bar['maximum'] = total
            self.progress_bar['value'] = 0
            self.root.update()
            
            # Process each row
            for i, row in enumerate(data):
                self.create_diploma(row, i)
                self.progress_bar['value'] = i + 1
                self.progress_var.set(f"Processing: {i+1}/{total}")
                self.root.update()
            
            messagebox.showinfo("Success", f"Successfully generated {total} diploma(s)!\nOutput folder: {self.output_folder}")
            self.progress_var.set("Completed!")
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to generate diplomas: {str(e)}")
        finally:
            self.generate_btn.config(state='normal')
    
    def create_diploma(self, text_data, index):
        """Create a single diploma image"""
        if self.template_image is None:
            self.template_image = Image.open(self.template_path)
        
        # Create a copy of the template
        img = self.template_image.copy()
        draw = ImageDraw.Draw(img)
        
        # Apply each enabled text field
        for field_idx, config in enumerate(self.field_configs):
            if not config['enabled'].get():
                continue
            
            try:
                # Get text value
                text = text_data[field_idx] if field_idx < len(text_data) else ''
                if not text:
                    continue
                
                # Get parameters
                x = int(config['x'].get())
                y = int(config['y'].get())
                font_name = config['font'].get()
                font_size = int(config['size'].get())
                align = config['align'].get()
                color = config['color'].get()
                
                # Try to load font, fallback to default
                try:
                    pil_font = ImageFont.truetype(f"{font_name}.ttf", font_size)
                except:
                    try:
                        pil_font = ImageFont.truetype(f"C:/Windows/Fonts/{font_name}.ttf", font_size)
                    except:
                        pil_font = ImageFont.load_default()
                
                # Get text bounding box
                bbox = draw.textbbox((0, 0), text, font=pil_font)
                text_width = bbox[2] - bbox[0]
                text_height = bbox[3] - bbox[1]
                
                # Calculate position based on alignment
                if align == 'center':
                    x = x - text_width // 2
                elif align == 'right':
                    x = x - text_width
                
                # Draw text
                draw.text((x, y), text, font=pil_font, fill=color)
                
            except Exception as e:
                print(f"Error processing field {field_idx}: {str(e)}")
                continue
        
        # Save image
        filename = f"diploma_{index + 1:04d}.png"
        filepath = os.path.join(self.output_folder, filename)
        img.save(filepath)


def main():
    root = tk.Tk()
    app = DiplomaGeneratorApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
