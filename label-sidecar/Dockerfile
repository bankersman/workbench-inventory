# syntax=docker/dockerfile:1

FROM python:3.11-slim-bookworm AS pybuild

WORKDIR /app

COPY label-sidecar/requirements.txt .

RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM gcr.io/distroless/python3-debian12:nonroot

WORKDIR /opt/sidecar

COPY --from=pybuild --chown=65532:65532 /install/lib/python3.11/site-packages /install/lib/python3.11/site-packages

COPY --chown=65532:65532 label-sidecar/sidecar.py ./sidecar.py

ENV PYTHONPATH=/install/lib/python3.11/site-packages
ENV PYTHONUNBUFFERED=1
ENV LABEL_SIDECAR_PORT=5050

EXPOSE 5050

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD ["/usr/bin/python3.11", "-c", "import os,urllib.request; urllib.request.urlopen('http://127.0.0.1:'+os.environ.get('LABEL_SIDECAR_PORT','5050')+'/status', timeout=3)"]

CMD ["/opt/sidecar/sidecar.py"]
