# 2019 AMC 12A Problem 7

> This problem is the same as [2019 AMC 10A #12](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #7](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
Melanie computes the mean $\mu$, the median $M$, and the modes of the $365$ values that are the dates in the months of $2019$. Thus her data consist of $1$2 $\text{s}$, 12 $\text{s}$, . . . , 12 $\text{s}$, 11 $\text{s}$, 11 $\text{s}$, and $7\text{s}$. Let $d$ be the median of the modes. Which of the following statements is true?

$\textbf{(A) } \mu < d < M \qquad\textbf{(B) } M < d < \mu \qquad\textbf{(C) } d = M =\mu \qquad\textbf{(D) } d < M < \mu \qquad\textbf{(E) } d < \mu < M$
## Solution 1
First of all, $d$ obviously has to be smaller than $M$, since when calculating $M$, we must take into account the $2$9s, $30$s, and $31$s. So we can eliminate choices $B$ and $C$. Since there are $365$ total entries, the median, $M$, must be the $\text{rd}$ one, at which point we note that $12 \cdot 15$ is $180$, so $16$ has to be the median (because $183$ is between $12 \cdot 15 + 1 = 181$ and $12 \cdot 16 = 192$). Now, the mean, $\mu$, must be smaller than $16$, since there are many fewer $2$9s, $30$s, and $3$1s. $d$ is less than $\mu$, because when calculating $\mu$, we would include $2$9, $30$, and $31$. Thus the answer is $\boxed{\textbf{(E) } d < \mu < M}$.
## Solution 2
As in Solution 1, we find that the median is $16$. Then, looking at the modes $(1-28)$, we realize that even if we were to have $12$ of each, their median would remain the same, being $14.5$. As for the mean, we note that the mean of the first $28$ is simply the same as the median of them, which is $14.5$. Hence, since we in fact have $2$9's, $30$'s, and $31$'s, the mean has to be higher than $14.5$. On the other hand, since there are fewer $2$9's, $30$'s, and $31$'s than the rest of the numbers, the mean has to be lower than $16$ (the median). By comparing these values, the answer is $\boxed{\textbf{(E) } d < \mu < M}$.
## Solution 3 (direct calculation)
We can solve this problem simply by carefully calculating each of the values, which turn out to be $M=16, d=14.5$, and $\mu = \frac{\sum_{n=1}^{30} 12n - 29 - 30 +31*7}{365} \approx 15.7$. Thus the answer is $\boxed{\textbf{(E) } d < \mu < M}$.
## Solution 4 (Definitions)
We learned that a mean is more accurate than a median, but when in the face of a list with greater size and almost no variety, $\mu < M$. We can quite easily calculate $d = 14.5$, and can see that the median will obviously be greater than the median of the mode, and the mean of the entire list will obviously be greater than the median of the modes as it is more accurate. Therefore our answer is $\boxed{\textbf{(E) } d < \mu < M}$.

*~Pinotation*
## Video Solution 1
https://youtu.be/3xVKbAVkHo8

Education, the Study of Everything
## Video Solution 2
https://youtu.be/tzaUr4iVfgc

*~savannahsolver*
## See Also
