import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: blockyData, error: blockyError } = useWidgetAPI(widget);

  if (blockyError) {
    return <Container service={service} error={blockyError} />;
  }

  if (!widget.fields) {
    widget.fields = ["queries", "blocked", "denylist"];
  }

  if (!blockyData) {
    return (
      <Container service={service}>
        <Block label="blocky.queries" />
        <Block label="blocky.blocked" />
        <Block label="blocky.denylist" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="blocky.queries" value={t("common.number", { value: blockyData.queries })} />
      <Block label="blocky.blocked"
        value={`${t("common.number", { value: blockyData.blocked })} (${
          t("common.percent", { value: blockyData.blocked_percentage })
        })`}
      />
      <Block label="blocky.denylist" value={t("common.number", { value: blockyData.denylist })} />
    </Container>
  );
}
