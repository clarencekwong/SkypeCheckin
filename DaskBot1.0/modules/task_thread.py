import threading

class TaskThread(threading.Thread):
    """Thread that executes a task every N seconds"""

    def __init__(self, task, **kwargs):
        threading.Thread.__init__(self)
        self._finished = threading.Event()
        self._interval = 3600
        self.task = task
        self.args = kwargs

    def set_interval(self, interval):
        """Set the number of seconds we sleep between executing our task"""
        self._interval = interval

    def run(self):
        while 1:
            if self._finished.isSet(): 
                return
            self.task(**self.args)
            self._finished.wait(self._interval)
