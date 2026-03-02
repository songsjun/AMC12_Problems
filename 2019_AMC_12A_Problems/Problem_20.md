# 2019 AMC 12A Problem 20

> This problem is the same as [2019 AMC 10A #22](https://artofproblemsolving.com/wiki/index.php/2019_AMC_10A_Problems) and [2019 AMC 12A #20](https://artofproblemsolving.com/wiki/index.php/2019_AMC_12A_Problems).
## Problem
Real numbers between 0 and 1, inclusive, are chosen in the following manner. A fair coin is flipped. If it lands heads, then it is flipped again and the chosen number is 0 if the second flip is heads, and 1 if the second flip is tails. On the other hand, if the first coin flip is tails, then the number is chosen uniformly at random from the closed interval $[0,1]$. Two random numbers $x$ and $y$ are chosen independently in this manner. What is the probability that $|x-y| > \tfrac{1}{2}$?

$\textbf{(A) } \frac{1}{3} \qquad \textbf{(B) } \frac{7}{16} \qquad \textbf{(C) } \frac{1}{2} \qquad \textbf{(D) } \frac{9}{16} \qquad \textbf{(E) } \frac{2}{3}$
## Solution 1
There are several cases depending on what the first coin flip is when determining $x$ and what the first coin flip is when determining $y$.

The four cases are:

**Case 1**: $x$ is either $0$ or $1$, and $y$ is either $0$ or $1$.

**Case 2**: $x$ is either $0$ or $1$, and $y$ is chosen from the interval $[0,1]$.

**Case 3**: $x$ is is chosen from the interval $[0,1]$, and $y$ is either $0$ or $1$.

**Case 4**: $x$ is is chosen from the interval $[0,1]$, and $y$ is also chosen from the interval $[0,1]$.

Each case has a $\frac{1}{4}$ chance of occurring (as it requires two coin flips).

For Case 1, we need $x$ and $y$ to be different. Therefore, the probability for success in Case 1 is $\frac{1}{2}$.

For Case 2, if $x$ is 0, we need $y$ to be in the interval $\left(\frac{1}{2}, 1\right]$. If $x$ is 1, we need $y$ to be in the interval $\left[0, \frac{1}{2}\right)$. Regardless of what $x$ is, the probability for success for Case 2 is $\frac{1}{2}$.

By symmetry, Case 3 has the same success rate as Case 2.

For Case 4, we must use geometric probability because there are an infinite number of pairs $(x, y)$ that can be selected, whether they satisfy the inequality or not. Graphing $|x-y| > \tfrac{1}{2}$ gives us the following picture where the shaded area is the set of all the points that fulfill the inequality:

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
filldraw((0,0)--(0,1)--(1/2,1)--(0,1/2)--cycle,black+linewidth(1));
filldraw((0,0)--(1,0)--(1,1/2)--(1/2,0)--cycle,black+linewidth(1));
draw((0,0)--(0,1)--(1,1)--(1,0)--cycle);
```

</asy>

The shaded area is $\frac{1}{4}$, which means the probability for success for case 4 is $\frac{1}{4}$ (since the total area of the bounding square, containing all possible pairs, is $1$).

Adding up the success rates from each case, we get:

$\left(\frac{1}{4}\right) \cdot \left(\frac{1}{2} + \frac{1}{2} + \frac{1}{2} + \frac{1}{4}\right) = \boxed{\textbf{(B) }\frac{7}{16}}$.
## Solution 2
Taking into account that there are two options for the result of the first coin flip, there are four possible combinations with equal possibility of initial coins flips.

(1) x: heads, y: heads

(2) x: heads, y: tails

(3) x: tails, y: heads

(4) x: tails, y: tails

(1) Because x and y both must be integers, so it's simple to see that the probability that $|x-y| > \tfrac{1}{2}$ is $\frac{1}{2}$.

(2) Since x has to be an integer it is also easy to see that the probability is again $\frac{1}{2}$.

(3) This is the same as case 2 so the probability is $\frac{1}{2}$.

(4) This one is a little bit tricky. You could use geometric probability shown above, but if you don't understand it or happened to not think of it, there is another solution that involves using the multiple choice answers.

First, the probability we have so far is $\frac{3}{8}$.This is greater than $\frac{1}{3}$ so $A$ is the not the answer. It is either $B, C, D,$ or $E$. Let's draw out the probability with two parallel lines on a paper with represent a number line from $0-1$. The concept is to compare one point and find the fraction of the other line that contains points that are at least $\frac{1}{2}$ away from it. If the point we choose is on the endpoints, then the fraction of the other line that works is exactly $\frac{1}{2}$. But as we move this point closer to the middle, the deadzone (area where the other point cannot be) grows, diminishing the probability. Finally, when it is directly in the middle, there are no points that pass the requirements except at $1$ and $0$.

So, looking at the choices again, we have $\frac{7}{16}$, $\frac{1}{2}$, $\frac{9}{16}$, and $\frac{2}{3}$.

$\frac{1}{2}$ is exactly $\frac{1}{8}$ more than the probability we had before. Notice that this is impossible because we proved that the average probability of the fourth case is lower than $\frac{1}{2}$, so the answer is $\boxed{B}$.

*~jackshi2006*
## Solution 3 (with Table)
First, calculate the conditional probabilities:

$P(x\in[0,\frac{1}{2}) \mid x\in[0,1]) = \frac{1}{2}$,  $P(|x-y|>\frac{1}{2} \mid x\in[0,1], y=1) = \frac{1}{2}$

$P(x\in(\frac{1}{2},1] \mid x\in[0,1]) = \frac{1}{2}$,  $P(|x-y|>\frac{1}{2} \mid x\in[0,1], y=0) = \frac{1}{2}$

$P(y\in[0,\frac{1}{2}) \mid y\in[0,1]) = \frac{1}{2}$,  $P(|x-y|>\frac{1}{2} \mid x=1, y\in[0,1]) = \frac{1}{2}$

$P(y\in(\frac{1}{2},1] \mid y\in[0,1]) = \frac{1}{2}$,  $P(|x-y|>\frac{1}{2} \mid x=0, y\in[0,1]) = \frac{1}{2}$

As stated in Solution 1, $P(|x-y|>\frac{1}{2} \mid \in[0,1], \in[0,1]) = \frac{1}{4}$

Next, calculate the dependent event probabilities by $P(A \cap B)= P(A \mid B) \cdot P(B)$, draw a table to calculate $P(|x-y|>\frac{1}{2})$ by the dependent events:


$$\begin{array}[b]{cccc}
$$& P(x=0)=\frac{1}{4} & P(x=1)=\frac{1}{4} & P(x \in [0,1])=\frac{1}{2} \\$$
 &  &  &  \\

$$P(y=0)=\frac{1}{4} & 0 & \frac{1}{4} \cdot \frac{1}{4} = \frac{1}{16} & \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{4} = \frac{1}{16} \\$$

 &  &  &  \\

$$P(y=1)=\frac{1}{4} & \frac{1}{4} \cdot \frac{1}{4} = \frac{1}{16} & 0 & \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{4} = \frac{1}{16} \\$$

 &  &  &  \\

$$P(y \in [0,1])=\frac{1}{2} & \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{4} = \frac{1}{16} & \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{4} = \frac{1}{16} & \frac{1}{2} \cdot \frac{1}{2} \cdot \frac{1}{4} = \frac{1}{16}$$

$\end{array}$$$


The sum of all the cell values is $\boxed{\textbf{(B)}\frac{7}{16}}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 4
Notice the probability that $|x-y| > \tfrac{1}{2}$ is equal to $2$ times the probability that $x-y > \tfrac{1}{2}$.

For $x-y > \tfrac{1}{2}$ to be true; there are $4$ cases.

Case $1$: $x$ flips $T$ and $y$ flips $T$

When $x$ flips $T$ and $y$ flips $T$, both $x$ and $y$ are randomly chosen from the interval $[0,1]$. The probability that $x-y > \tfrac{1}{2}$ when both $x$ and $y$ are randomly chosen from the interval $[0,1]$ is $\frac18$, as illustrated in the geometric probability diagram below.

<asy>

> [Asymptote diagram - not rendered in Markdown]

```asy
size(3cm,0);
filldraw((0,0)--(1,0)--(1,1/2)--(1/2,0)--cycle,black+linewidth(1));
draw((0,0)--(0,1)--(1,1)--(1,0)--cycle);
```

</asy>

Therefore, the probability for Case $1$ is $\frac12 \cdot \frac12 \cdot \frac18 = \frac{1}{32}$

Case $2$: $x$ flips $HT$ and $y$ flips $T$

When $x$ flips $HT$ and $y$ flips $T$, $x=1$, and $y$ is randomly chosen from the interval $[0,1]$. The probability that $x-y > \tfrac{1}{2}$ when $x=1$, and $y$ is randomly chosen from the interval $[0,1]$ is $\frac12 (y$ has to be between $[0,\frac12]$).

Therefore, the probability for Case $2$ is $\frac12 \cdot \frac12 \cdot \frac12 \cdot \frac12 = \frac{1}{16}$

Case $3$: $x$ flips $T$ and $y$ flips $HH$

When $x$ flips $T$ and $y$ flips $HH$, $x$ is randomly chosen from the interval $[0,1]$, and $y = 0$. The probability that $x-y > \tfrac{1}{2}$ when $x$ is randomly chosen from the interval $[0,1]$, and $y = 0$is $\frac12 (x$ has to be between $[\frac12,1]$).

Therefore, the probability for Case $3$ is $\frac12 \cdot \frac12 \cdot \frac12 \cdot \frac12 = \frac{1}{16}$

Case $4$: $x$ flips $HT$ and $y$ flips $HH$

When $x$ flips $HT$ and $y$ flips $HH$, $x=1$, and $y = 0$. The probability that $x-y > \frac{1}{2}$ when $x=1$, and $y = 0$ is $1$.

Therefore, the probability for Case $4$ is $\frac12 \cdot \frac12 \cdot \frac12 \cdot \frac12 \cdot 1= \frac{1}{16}$

Hence, the answer is $2(\frac{1}{32} + \frac{1}{16} + \frac{1}{16} + \frac{1}{16}) = \boxed{\textbf{(B)}\frac{7}{16}}$

~[https://artofproblemsolving.com/wiki/index.php/User:Isabelchen isabelchen]
## Solution 5
The probability of choosing $0$ and $1$ with the first coin landing on heads are both $\frac{1}{4}$. The probability of choosing a number less than $\frac{1}{2}$, $l$, and a number greater than $\frac{1}{2}$, $g$, with the first coin landing on tails are both $\frac{1}{4}$.

For pairs $(x, y)$, the probability of choosing $(0, 1)$, (1, 0), (0, g), (g, 0), (1, l)$$ and $(l, 1)$ are all $\frac{1}{16}$. However, $(l, g)$ and $(g, l)$ are $\frac{1}{32}$ respectively.

Therefore, $\frac{1}{16} \cdot 6 + \frac{1}{32} \cdot 2 = \boxed{\textbf{(B) } \frac{7}{16}}$.

*~MaPhyCom*
## Solution 6 (Educated Guess)
Notice how if we choose $x = 0$ and $y \in [0, 1/2)$, we then see that there is going to be a chance that is slightly less than $1/2$. We then see that this is apparent for $y=0$ and $x \in [0, 1/2)$.

Now, if $x = 0$ and $y = 0$, this is obviously not going to work, so we have to subtract a case. The same applies for $x = 1$ and $y = 1$, and we subtract another case.

Additionally, we can include $x = 1, y = 0$ and $y = 0, x = 1$, giving us 2 cases that work, and we see that this is part of the $(1/2 , 1]$ interval, and therefore it doesn't change the outcome.

We are looking for a solution that is slightly less than $1/2$. The only one is $\boxed{\textbf{(B) } \frac{7}{16}}$

*~Pinotation*
## Video Solution 1
https://youtu.be/wimynTAVIx8

Education, the Study of Everything
## Video Solution 2
https://youtu.be/ZhAZ1oPe5Ds?t=263

*~pi_is_3.14*
## Video Solution (Interactive Teaching Approach)
https://www.youtube.com/watch?v=6nrF-cXQpME

*~MathkidsbyMax*
## Video Solution by Richard Rusczyk
https://www.youtube.com/watch?v=Fe5bDwSzsOs
## See Also
