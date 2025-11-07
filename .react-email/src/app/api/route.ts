import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import path from "path";
import fs from "fs";

// GET route - List available email templates
export async function GET() {
  try {
    const emailsDir =
      process.env.EMAILS_DIR_ABSOLUTE_PATH ||
      path.resolve(process.cwd(), "emails");

    if (!fs.existsSync(emailsDir)) {
      return NextResponse.json(
        { error: "Emails directory not found" },
        { status: 404 }
      );
    }

    const files = fs
      .readdirSync(emailsDir)
      .filter((file) => file.endsWith(".tsx"))
      .map((file) => file.replace(".tsx", ""));

    return NextResponse.json({
      templates: files,
      message: "Available email templates",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to list templates",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST route - Render or send email
export async function POST(request: NextRequest) {
  try {
    const { template, action = "render", props = {} } = await request.json();

    if (!template) {
      return NextResponse.json(
        { error: "Template name is required" },
        { status: 400 }
      );
    }

    const emailsDir =
      process.env.EMAILS_DIR_ABSOLUTE_PATH ||
      path.resolve(process.cwd(), "emails");
    const templatePath = path.join(emailsDir, `${template}.tsx`);

    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: `Template '${template}' not found` },
        { status: 404 }
      );
    }

    // Dynamically import the email component
    const emailModule = await import(templatePath);
    const EmailComponent = emailModule.default || emailModule[template];

    if (!EmailComponent) {
      return NextResponse.json(
        { error: "Email component not found in template" },
        { status: 500 }
      );
    }

    if (action === "render") {
      // Render email to HTML
      const html = render(EmailComponent(props));
      const text = render(EmailComponent(props), { plainText: true });

      return NextResponse.json({
        html,
        text,
        template,
        props,
      });
    }

    // For future implementation: actual email sending
    if (action === "send") {
      return NextResponse.json(
        {
          error: "Email sending not implemented yet",
          message: "This feature will be available in a future update",
        },
        { status: 501 }
      );
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "render" or "send"' },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
