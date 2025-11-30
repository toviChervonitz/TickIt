import Image from "next/image";

import {
  Box,
  Button,
  Container,
  Typography,
  Card,
  GridLegacy as Grid,
  Stack,
  Chip,
} from "@mui/material";
import Link from "next/link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import GroupsIcon from "@mui/icons-material/Groups";
import InsightsIcon from "@mui/icons-material/Insights";
import { useLanguage } from "./context/LanguageContext";
import { getTranslation } from "./lib/i18n";

export default function Home() {
      const { lang } = useLanguage();
      const t = getTranslation(lang);
  
  const features = [
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("project"),
      text: t("createPlanTrack"),
    },
    {
      icon: <GroupsIcon sx={{ fontSize: 40, color: "secondary.main" }} />,
      title: t("collaboration"),
      text: t("workTogether"),
    },
    {
      icon: <InsightsIcon sx={{ fontSize: 40, color: "primary.main" }} />,
      title: t("advancedAnalytics"),
      text: t("gainInsights"),
    },
  ];

  const benefits = [
t("aiAgent"),
    t("effortlessManagement"),
    t("builtInPermission"),
    t("remindersEmailActions"),
  ];
  
  return (
    <Box sx={{ overflow: "hidden" }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #1d486a 0%, #122d42 100%)",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(61,210,204,0.15) 0%, transparent 50%)",
          },
        }}
      >
        <Container
          maxWidth="lg"
          sx={{ py: { xs: 8, md: 12 }, position: "relative", zIndex: 1 }}
        >
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Chip
                label={t("leadingPlatform")}
                sx={{
                  mb: 3,
                  backgroundColor: "rgba(61,210,204,0.2)",
                  color: "#3dd2cc",
                  fontWeight: 600,
                  border: "1px solid rgba(61,210,204,0.3)",
                }}
              />

              <Typography
                variant="h2"
                fontWeight={800}
                color="white"
                sx={{
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                  lineHeight: 1.2,
                  mb: 3,
                }}
              >
                {t("smartTask")}
                <Box
                  component="span"
                  sx={{ color: "#3dd2cc", display: "block" }}
                >
                  {t("managementSystem")}
                </Box>
              </Typography>

              <Typography
                variant="h6"
                color="rgba(255,255,255,0.85)"
                sx={{ mb: 4, lineHeight: 1.7, fontWeight: 400 }}
              >
                {t("manageProjects")}
              </Typography>

              <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
                <Button
                  component={Link}
                  href="/pages/login"
                  variant="contained"
                  size="large"
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: "1.1rem",
                    color: "#3dd2cc",
                    border: "1px solid rgba(61,210,204,0.3)",
                    fontWeight: 700,
                    "&:hover": {
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  {t("login")}
                </Button>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                  transform: "perspective(1000px) rotateY(-5deg)",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "perspective(1000px) rotateY(0deg)",
                  },
                }}
              >
                <Box
                  component="img"
                  src="/screenshot.png"
                  alt="Task management preview"
                  sx={{
                    width: "100%",
                    display: "block",
                    border: "8px solid rgba(255,255,255,0.1)",
                    borderRadius: 3,
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ backgroundColor: "#f7f5f0", py: 10 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Chip
              label={t("advancedFeatures")}
              sx={{
                mb: 2,
                backgroundColor: "white",
                fontWeight: 600,
                px: 2,
              }}
            />
            <Typography
              variant="h3"
              fontWeight={800}
              color="primary.main"
              sx={{ mb: 2 }}
            >
{t("everythingYourTeamNeeds")}            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              maxWidth="700px"
              mx="auto"
            >
{t("advancedTools")}            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, i) => (
              <Grid key={i} item xs={12} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={2}
                    color="primary.main"
                  >
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" lineHeight={1.7}>
                    {feature.text}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography
              variant="h3"
              fontWeight={800}
              color="primary.main"
              mb={3}
            >
              {t("whyChooseUs")}
            </Typography>
            <Typography
              variant="h6"
              color="text.secondary"
              mb={4}
              lineHeight={1.8}
            >
{t("whyChooseUsDescription")}            </Typography>

            <Stack spacing={2.5}>
              {benefits.map((benefit, i) => (
                <Stack key={i} direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      minWidth: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "rgba(61,210,204,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CheckCircleIcon sx={{ color: "#3dd2cc", fontSize: 24 }} />
                  </Box>
                  <Typography
                    fontSize="1.1rem"
                    fontWeight={600}
                    color="text.primary"
                  >
                    {benefit}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
              }}
            >
              <Box
                component="img"
                src="/screenshot.png"
                alt="Features preview"
                sx={{
                  width: "100%",
                  display: "block",
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Box
        sx={{
          background: "linear-gradient(135deg, #1d486a 0%, #0d2636 100%)",
          py: 10,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 80% 50%, rgba(61,210,204,0.1) 0%, transparent 50%)",
          },
        }}
      >
        <Container
          maxWidth="md"
          sx={{ textAlign: "center", position: "relative", zIndex: 1 }}
        >
          <Typography variant="h3" fontWeight={800} color="white" mb={3}>
            {t("leadYourTeamToSuccess")}
          </Typography>

          <Typography
            variant="h6"
            color="rgba(255,255,255,0.85)"
            mb={5}
            lineHeight={1.8}
          >
{t("joinNow")}          </Typography>

          <Button
            component={Link}
            href="/pages/register"
            variant="contained"
            size="large"
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              color: "#3dd2cc",
              border: "1px solid rgba(61,210,204,0.3)",
              fontWeight: 700,
              "&:hover": {
                transform: "translateY(-3px)",
              },
              transition: "all 0.3s ease",
            }}
          >
            {t("createAccount")}
          </Button>

          <Stack
            direction="row"
            spacing={4}
            justifyContent="center"
            sx={{ mt: 5 }}
          >
            {[
              t("noCreditCardRequired"),
              t("startInMinutes"),
              t("cancelAnytime"),
            ].map((text, i) => (
              <Typography
                key={i}
                color="rgba(255,255,255,0.7)"
                fontSize="0.95rem"
                sx={{ display: { xs: "none", md: "block" } }}
              >
                ✓ {text}
              </Typography>
            ))}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
