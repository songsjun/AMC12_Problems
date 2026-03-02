# 2020 AMC 12A Problem 13

## Problem
There are integers a, b, and c, each greater than 1, such that

$$\sqrt[a]{N\sqrt[b]{N\sqrt[c]{N}}} = \sqrt[36]{N^{25}}$$

for all N $\neq 1.$ What is b?

$\textbf{(A) } 2 \qquad \textbf{(B) } 3 \qquad \textbf{(C) } 4 \qquad \textbf{(D) } 5 \qquad \textbf{(E) } 6$
## Solution 1
$\sqrt$[a]{N$\sqrt$[b]{N$\sqrt$[c]{N}}} can be simplified to $N^{\frac{1}{a}+\frac{1}{ab}+\frac{1}{abc}}$.

The equation is then $N^{\frac{1}{a}+\frac{1}{ab}+\frac{1}{abc}}$=$N^{\frac{25}{36}}$ which implies that $\frac{1}{a}+\frac{1}{ab}+\frac{1}{abc}=\frac{25}{36}.$

a has to be 2 since $\frac{25}{36}>\frac{7}{12}. \frac{7}{12}$ is the result when a, b, and c are 3, 2, and 2

b being 3 will make the fraction $\frac{2}{3}$ which is close to $\frac{25}{36}.$

Finally, with c being 6, the fraction becomes $\frac{25}{36}.$ In this case a, b, and c work, which means that b must equal $\boxed{\textbf{(B) } 3.}$~lopkiloinm
## Solution 2
As above, notice that you get $\frac{1}{a}+\frac{1}{ab}+\frac{1}{abc}=\frac{25}{36}.$

Now, combine the fractions to get $\frac{bc+c+1}{abc}=\frac{25}{36}.$

Let us assume bc+$c+1=25$ and abc=36 as this is the most convenient. (EDIT: This used to say WLOG but that is inaccurate)

From the first equation, we get c$(b+1)=24$. Note also that from the second equation, b and c must be factors of 36.

After listing out the factors of 36 and utilising trial and error, we find that $c=6$ and $b=3$ works, with $a=2$. So our answer is $\boxed{\textbf{(B) } 3.}$

*~Silverdragon*

Edits by ~Snore, ~Swaggergotcha
## Solution 3
Collapsed, $\sqrt$[a]{N$\sqrt$[b]{N$\sqrt$[c]{N}}} = $\sqrt$[abc]{$N^{bc+c+1}$}. Comparing this to $\sqrt$[36]{$N^{25}$}, observe that bc+$c+1=25$ and abc=36. The first can be rewritten as c$(b+1)=24$. Then, $b+1$ has to factor into 24 while 1 less than that also must factor into 36. The prime factorizations are as follows $36=2^2 3^2$ and 24=2^33. Then, $b=\boxed{\textbf{B)}3},$ as only 4 and 3 factor into 36 and 24 while being 1 apart.

~~BJHHar

Note: 3 and 2 also factor into 24 and 36 while being 1 apart, but we can eliminate by quick guess and check. ~ Edit by Soupnoodle
## Solution 4
$\sqrt$[a]{N$\sqrt$[b]{N$\sqrt$[c]{N}}} = $\sqrt$[36]{$N^{25}$} can be rewritten as $\frac{\frac{\frac{1}{c}+1}{b}+1}{a} = \frac{25}{36}.$ The trick is to focus on the properties of the denominators and numerators. a must be either be a factor of 36, because in any other situation the denominator of the final expression is preserved, and b is forced to be 36, which is not an answer choice. Next, realize that the numerator of $\frac{\frac{1}{c}+1}{b}+1$ must be 25, and even more importantly, that the denominator must be large enough so that when 1 is subtracted from it, it will form a fraction less than 1. The only number large enough to do this will also being a fraction of 36 is 18. This means that a is 2. Moving onward, we are left with $\frac{\frac{1}{c}+1}{b} = \frac{7}{18}.$ Since b must be a factor of 18, just plug in values from the answer choices to find that c=6 and b=3.

*~jackshi2006*
## See Also
